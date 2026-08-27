import "./style.scss"
import "choices.js/public/assets/styles/choices.min.css"
import Choices from "choices.js"
import { ABILITIES, type Ability, type CharacterRecordV1, type PaperSize } from "./types"
import { ANCESTRIES, BEASTKIN_ADAPTATIONS, CANTRIPS, COMMON_LANGUAGES, DRAGON_LINEAGES, DRAGON_TRAITS, EXOTIC_LANGUAGES, FOCUSES, OCCUPATIONS, POWERS, SHIFTER_FORMS, SKILLS, TIEFLING_TRAITS, TOOLS, TRINKETS, UNCOMMON_LANGUAGES, WARFORGED_SCARS, WEAPONS } from "./data"
import { createFunnelBatch, cryptoRandom, deriveCharacter, generateAncestryChoices, generateName, generateOccupationChoices, rollAbility, validateCharacter } from "./domain"
import { downloadCharacterPdf } from "./pdf"
import { createCharacterStore } from "./storage"

const root = document.querySelector<HTMLDivElement>("#app")!
const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`
const store = createCharacterStore()
let state = store.getState()
let selecting = false
let selected = new Set<string>()
let rosterFilter: "all" | "living" | "deceased" = "all"
let draft: CharacterRecordV1 | undefined
let dirty = false

const esc = (v: unknown) => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!))
const title = (v: string) => v.replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase())
type Opt = { id: string | number; name?: string; text?: string; points?: number }
const opts = (items: readonly (string|Opt)[], value?: string|number) => items.map(item => {
  const id = typeof item === "string" ? item : item.id
  const name = typeof item === "string" ? title(item) : item.name ?? item.text ?? String(item.id)
  return `<option value="${esc(id)}" ${String(id)===String(value)?"selected":""}>${esc(name)}</option>`
}).join("")
const allLanguages=[...COMMON_LANGUAGES,...UNCOMMON_LANGUAGES,...EXOTIC_LANGUAGES]

function shell(body:string){
 root.innerHTML=`<div class="site-shell"><header class="masthead"><a class="brand" href="#/" aria-label="Chronicles of Orrin"><img src="${asset("logo.png")}" alt="Chronicles of Orrin"></a></header>${store.warning?`<div class="warning" role="alert">${esc(store.warning)}</div>`:""}<main>${body}</main><footer>Made for the wastes · <a href="https://www.dndbeyond.com/srd" target="_blank" rel="noreferrer">SRD 5.1 · CC BY 4.0</a></footer></div>`
}
function stats(c:CharacterRecordV1){const d=deriveCharacter(c);return ABILITIES.map(a=>`<span><b>${a.toUpperCase()}</b> ${d.finalAbilities[a]}<small>${d.modifiers[a]>=0?"+":""}${d.modifiers[a]}</small></span>`).join("")}
const skillAbilities:Record<string,Ability>={"Acrobatics":"dex","Animal Handling":"wis","Arcana":"int","Athletics":"str","Deception":"cha","History":"int","Insight":"wis","Intimidation":"cha","Investigation":"int","Medicine":"wis","Nature":"int","Perception":"wis","Performance":"cha","Persuasion":"cha","Religion":"int","Sleight of Hand":"dex","Stealth":"dex","Survival":"wis"}
function skillList(c:CharacterRecordV1){const d=deriveCharacter(c);return SKILLS.map(skill=>{const proficient=d.proficiencies.includes(skill);const value=d.modifiers[skillAbilities[skill]!]+(proficient?d.proficiencyBonus:0);return `<li class="${proficient?"proficient":""}"><span>${proficient?"◆":"◇"} ${skill}</span><b>${value>=0?"+":""}${value}</b></li>`}).join("")}
const foldedTraitIds=new Set(["tool","skilled","staying-power","keen","wild","instinct","fleet-stride","tough-hide","design","menacing","beast-legs"])
function ancestryFeatures(c:CharacterRecordV1){const d=deriveCharacter(c);const items=d.traits.filter(t=>!foldedTraitIds.has(t.id)).map(t=>`<li><strong>${esc(t.name)}</strong><span>${esc(t.summary)}</span></li>`);if(c.ancestryChoices.focus)items.push(`<li><strong>Focus</strong><span>${esc(c.ancestryChoices.focus)}</span></li>`);if(c.ancestryChoices.runeTarget)items.push(`<li><strong>Rune Target</strong><span>${esc(c.ancestryChoices.runeTarget)}</span></li>`);return items.join("")}
function card(c:CharacterRecordV1){const d=deriveCharacter(c);return `<article class="character-card ${d.status}" data-open="${c.id}" tabindex="0">${selecting?`<label class="check"><input type="checkbox" data-select="${c.id}" ${selected.has(c.id)?"checked":""}><span>Select</span></label>`:""}<div class="fate-copy"><h3>${esc(c.name)}</h3><p>${esc(d.ancestry.name)} <i>◆</i> ${esc(d.occupation.name)}</p>${d.status==="deceased"&&c.causeOfDeath?`<p class="death-cause">${esc(c.causeOfDeath)}</p>`:""}<div class="fate-vitals"><span class="hp">${d.maxHp} HP</span><span class="def">${d.armorClass} DEF</span></div></div><div class="fate-seal"><img src="${asset(d.status==="living"?"living-sun.webp":"fallen-mark.webp")}" alt=""><strong>${d.status==="living"?"Living":"Fallen"}</strong></div></article>`}
function roster(){
 draft=undefined;dirty=false
 const livingCount=state.characters.filter(c=>deriveCharacter(c).status==="living").length
 const ordered=[...state.characters].sort((a,b)=>b.createdAt.localeCompare(a.createdAt))
 const visible=ordered.filter(c=>rosterFilter==="all"||deriveCharacter(c).status===rosterFilter)
 shell(`<section class="doom-hero"><div class="doom-copy"><p class="eyebrow">Level-zero company</p><h1>The Doomed</h1><p><b>${state.characters.length}</b> ${state.characters.length===1?"character":"characters"}</p><span class="doom-rule">◇—☠—◇</span></div></section><section class="funnel-actions"><button class="primary roll" id="roll-batch" ${livingCount>=4?"disabled":""}><img src="${asset("dice.webp")}" alt=""> <span>Roll Four Wretches</span></button><button class="secondary funnel" id="print-toggle" ${state.characters.length?"":"disabled"}><img src="${asset("printer.webp")}" alt=""> <span>${selecting?"Cancel the Casting":"Cast Them Into the Funnel"}</span></button></section><section class="fates"><div class="section-title"><i></i><h2>Recorded Fates</h2><i></i></div><nav class="fate-filters" aria-label="Filter recorded fates"><button data-filter="all" class="${rosterFilter==="all"?"active":""}">◇ All</button><button data-filter="living" class="${rosterFilter==="living"?"active":""}">◇ Living</button><button data-filter="deceased" class="${rosterFilter==="deceased"?"active":""}">☠ Fallen</button></nav>${selecting?`<div class="selection-bar"><strong>${selected.size} marked</strong><button id="select-all" class="text-button">Mark all</button><button id="make-pdf" class="primary" ${selected.size?"":"disabled"}>Prepare the Funnel</button></div>`:""}<div class="cards">${visible.map(card).join("")}</div>${!state.characters.length?`<section class="empty"><span class="empty-die">◇</span><h2>No fates recorded</h2><p>Roll four wretches and see who survives the first breath.</p></section>`:!visible.length?`<section class="empty"><h2>No ${rosterFilter==="living"?"living souls":"fallen souls"}</h2></section>`:""}</section>`)
 document.querySelector("#roll-batch")?.addEventListener("click",()=>{const needed=4-state.characters.filter(c=>deriveCharacter(c).status==="living").length;if(needed<=0)return;store.addCharacters(createFunnelBatch(cryptoRandom,needed));state=store.getState();roster()})
 document.querySelector("#print-toggle")?.addEventListener("click",()=>{selecting=!selecting;selected.clear();roster()})
 document.querySelector("#select-all")?.addEventListener("click",()=>{selected=new Set(state.characters.map(c=>c.id));roster()})
 document.querySelectorAll<HTMLButtonElement>("[data-filter]").forEach(x=>x.addEventListener("click",()=>{rosterFilter=x.dataset.filter as typeof rosterFilter;roster()}))
 document.querySelectorAll<HTMLInputElement>("[data-select]").forEach(x=>x.addEventListener("click",e=>e.stopPropagation()))
 document.querySelectorAll<HTMLInputElement>("[data-select]").forEach(x=>x.addEventListener("change",()=>{x.checked?selected.add(x.dataset.select!):selected.delete(x.dataset.select!);roster()}))
 document.querySelectorAll<HTMLElement>("[data-open]").forEach(x=>{const open=(e:Event)=>{if((e.target as HTMLElement).closest("button,label,input"))return;const id=x.dataset.open!;if(selecting){selected.has(id)?selected.delete(id):selected.add(id);roster();return}location.hash="#/characters/"+id};x.addEventListener("click",open);x.addEventListener("keydown",e=>{if(e.key==="Enter")open(e)})})
 document.querySelectorAll<HTMLButtonElement>("[data-delete]").forEach(x=>x.addEventListener("click",e=>{e.stopPropagation();const c=state.characters.find(c=>c.id===x.dataset.delete);if(c&&confirm("Remove "+c.name+" from the ledger?")){store.deleteCharacter(c.id);state=store.getState();roster()}}))
 document.querySelector("#make-pdf")?.addEventListener("click",printDialog)
}
function printDialog(){
 const d=document.createElement("dialog");d.innerHTML=`<form method="dialog" class="print-dialog"><p class="eyebrow">Prepare the ledger</p><h2>Choose paper size</h2><label><input type="radio" name="paper" value="letter" ${state.paperSize==="letter"?"checked":""}> Letter <small>8.5 × 11 in</small></label><label><input type="radio" name="paper" value="a4" ${state.paperSize==="a4"?"checked":""}> A4 <small>210 × 297 mm</small></label><div><button value="cancel" class="secondary">Cancel</button><button value="confirm" class="primary">Download PDF</button></div></form>`;document.body.append(d);d.showModal();d.addEventListener("close",async()=>{if(d.returnValue==="confirm"){const paper=new FormData(d.querySelector("form")!).get("paper") as PaperSize;store.setPaperSize(paper);state=store.getState();await downloadCharacterPdf(state.characters.filter(c=>selected.has(c.id)),paper);selecting=false;selected.clear()}d.remove();roster()})
}
function field(name:string,label:string,value:string|number,type="number",reroll=false){return `<label class="field"><span>${label}</span><div><input name="${name}" type="${type}" value="${esc(value)}" ${type==="number"?"min=1 max=18":"maxlength=180"}>${reroll?`<button type="button" class="reroll" data-reroll="${name}">↻</button>`:""}</div></label>`}
function fixedField(name:string,label:string,value:number){return `<label class="field"><span>${label}</span><div><input name="${name}" type="number" value="${value}" readonly aria-readonly="true"></div></label>`}
function select(name:string,label:string,items:readonly (string|Opt)[],value?:string|number,reroll=true){return `<div class="field"><label for="field-${name}">${label}</label><div><select id="field-${name}" name="${name}">${opts(items,value)}</select>${reroll?`<button type="button" class="reroll" data-reroll="${name}">↻</button>`:""}</div></div>`}
function traits(name:string,items:readonly Opt[],chosen:string[]){return `<fieldset class="trait-picker"><legend>Ancestry traits · exactly 3 points</legend>${items.map(t=>`<label><input type="checkbox" name="${name}" value="${t.id}" ${chosen.includes(String(t.id))?"checked":""}><span>${t.name} <b>${t.points}</b></span></label>`).join("")}</fieldset>`}
function choices(c:CharacterRecordV1){const a=c.ancestryChoices,o=c.occupationChoices,f:string[]=[]
 if(["human","warforged"].includes(c.ancestryId))f.push(select("abilityBoost","Ability increase",ABILITIES,a.abilityBoost))
 if(c.ancestryId==="human")f.push(select("language1","Extra language I",allLanguages,a.languages?.[0]),select("language2","Extra language II",allLanguages,a.languages?.[1]))
 if(["deep-dwarf","sand-dwarf"].includes(c.ancestryId))f.push(select("tool","Tool training",TOOLS,a.tool))
 if(c.ancestryId==="smallfolk")f.push(select("focus","Focus",FOCUSES,a.focus))
 if(c.ancestryId==="sun-elf")f.push(select("cantrip","Cantrip",CANTRIPS,a.cantrip),select("weapon","Weapon training",WEAPONS,a.weapon))
 if(c.ancestryId==="beastkin")f.push(select("adaptation","Adaptation",BEASTKIN_ADAPTATIONS,a.adaptation))
 if(c.ancestryId==="dragonkin")f.push(select("dragonLineage","Primary lineage",DRAGON_LINEAGES.map(x=>x.name),a.dragonLineage),select("secondaryDragonLineage","Secondary lineage",DRAGON_LINEAGES.map(x=>x.name),a.secondaryDragonLineage),traits("ancestryTraits",DRAGON_TRAITS,a.traits??[]))
 if(c.ancestryId==="shifter")f.push(select("shift","Shifting form",SHIFTER_FORMS,a.shift))
 if(c.ancestryId==="warforged")f.push(select("skill","Skill",SKILLS,a.skill),select("tool","Tool",TOOLS,a.tool),select("scar","Damage scar",WARFORGED_SCARS,a.scar))
 if(c.ancestryId==="tiefling")f.push(traits("ancestryTraits",TIEFLING_TRAITS,a.traits??[]))
 if(c.ancestryId==="wode-elf")f.push(select("weapon","Weapon training",WEAPONS,a.weapon))
 if(OCCUPATIONS.find(x=>x.id===c.occupationId)?.special==="cantrip")f.push(select("occupationCantrip","Occupation cantrip",CANTRIPS,o.cantrip))
 if(OCCUPATIONS.find(x=>x.id===c.occupationId)?.special==="power")f.push(select("power","Rogue talent",POWERS,o.power))
 return f.join("")
}
function sync(form:HTMLFormElement){
 if(!draft)return;const fd=new FormData(form);draft.name=String(fd.get("name")||"Nameless").slice(0,60);for(const a of ABILITIES)draft.rawAbilities[a]=Number(fd.get("ability-"+a));draft.hpRoll=Number(fd.get("hpRoll"));draft.trinketAnswer="";draft.fateOverride=String(fd.get("fate")) as "living"|"deceased";draft.causeOfDeath=draft.fateOverride==="deceased"?String(fd.get("causeOfDeath")||"").slice(0,120):""
 const ancestry=String(fd.get("ancestryId")),occupation=Number(fd.get("occupationId"));if(ancestry!==draft.ancestryId){draft.ancestryId=ancestry;draft.ancestryChoices=generateAncestryChoices(ancestry)}if(occupation!==draft.occupationId){draft.occupationId=occupation;draft.occupationChoices=generateOccupationChoices(occupation)}draft.trinketId=Number(fd.get("trinketId"))
 const a=draft.ancestryChoices,o=draft.occupationChoices;for(const key of ["tool","skill","weapon","cantrip","focus","adaptation","dragonLineage","secondaryDragonLineage","shift","scar"] as const)if(fd.has(key))a[key]=String(fd.get(key));if(fd.has("abilityBoost"))a.abilityBoost=String(fd.get("abilityBoost")) as Ability;if(fd.has("language1"))a.languages=[String(fd.get("language1")),String(fd.get("language2"))];if(fd.has("ancestryTraits"))a.traits=fd.getAll("ancestryTraits").map(String);if(fd.has("occupationCantrip"))o.cantrip=String(fd.get("occupationCantrip"));if(fd.has("power"))o.power=String(fd.get("power"));dirty=true
}
function autosave(c:CharacterRecordV1){c.updatedAt=new Date().toISOString();store.updateCharacter(c);state=store.getState();dirty=false}
function editor(id:string){
 const original=state.characters.find(c=>c.id===id);if(!original){location.hash="#/";return}if(!draft||draft.id!==id)draft=structuredClone(original);const c=draft,d=deriveCharacter(c),errors=validateCharacter(c)
 shell(`<div class="editor-head"><a href="#/" class="back">← Return to roster</a><p class="eyebrow">Level-zero record</p><h1>${esc(c.name)}</h1><p class="status-line ${d.status}">${d.status} · ${esc(d.ancestry.name)} · ${esc(d.occupation.name)}</p></div><form id="character-form"><section class="sheet-grid"><div><div class="panel"><h2>Identity</h2><div class="form-grid">${field("name","Name",c.name,"text",true)}${select("ancestryId","Ancestry",ANCESTRIES,c.ancestryId)}${select("occupationId","Occupation",OCCUPATIONS,c.occupationId)}${select("trinketId","Trinket",TRINKETS,c.trinketId)}</div></div><div class="panel"><h2>Life & choices</h2><div class="form-grid">${fixedField("hpRoll","Hit point d4",c.hpRoll)}${select("fate","Fate",[{id:"living",name:"Living"},{id:"deceased",name:"Fallen"}],d.status,false)}${d.status==="deceased"?field("causeOfDeath","Cause of death",c.causeOfDeath??"","text"):""}${choices(c)}</div></div><div class="panel"><h2>Raw ability rolls</h2><p>4d6, drop the lowest. Ancestry increases appear in the final record.</p><div class="ability-fields">${ABILITIES.map(a=>field("ability-"+a,a.toUpperCase(),c.rawAbilities[a],"number")).join("")}</div></div></div><aside class="derived panel ${d.status}"><p class="eyebrow">Calculated record</p><div class="big-vitals"><span><b>${d.maxHp}</b> HP</span><span><b>${d.armorClass}</b> AC</span></div><div class="stats large">${stats(c)}</div><dl><dt>Speed / size</dt><dd>${d.speed} ft · ${d.size}</dd><dt>Hit dice</dt><dd>${d.hitDice}</dd><dt>Languages</dt><dd>${esc(d.languages.join(", "))}</dd><dt>Proficiencies</dt><dd>${esc(d.proficiencies.filter(item=>!SKILLS.some(skill=>skill===item)).join(", ")||"None")}</dd><dt>Gear</dt><dd>${esc(d.gear.join(", ")||"None")}</dd></dl>${ancestryFeatures(c)?`<section class="ancestry-features"><h2>Ancestry Features</h2><ul>${ancestryFeatures(c)}</ul></section>`:""}<section class="calculated-skills"><h2>Skills</h2><ul>${skillList(c)}</ul></section>${d.magic.length?`<section class="record-magic"><h2>Magic & Powers</h2><ul>${d.magic.map(item=>`<li>${esc(item)}</li>`).join("")}</ul></section>`:""}</aside></section>${errors.length?`<div class="validation" role="alert">${errors.map(x=>"<p>"+esc(x)+"</p>").join("")}</div>`:""}<div class="editor-actions"><button type="button" id="delete-character" class="danger">Delete</button></div></form>`)
 const form=document.querySelector<HTMLFormElement>("#character-form")!;const trinketSelect=form.elements.namedItem("trinketId") as HTMLSelectElement|null;if(trinketSelect)new Choices(trinketSelect,{searchEnabled:true,shouldSort:false,itemSelectText:"",searchPlaceholderValue:"Search trinkets",allowHTML:false});form.addEventListener("change",e=>{sync(form);autosave(c);if((e.target as HTMLInputElement).type!=="text")editor(c.id)});form.addEventListener("input",()=>{sync(form)})
 form.addEventListener("submit",e=>e.preventDefault())
 document.querySelectorAll<HTMLButtonElement>("[data-reroll]").forEach(b=>b.addEventListener("click",()=>{sync(form);const k=b.dataset.reroll!;if(k.startsWith("ability-"))c.rawAbilities[k.slice(8) as Ability]=rollAbility();else if(k==="hpRoll")c.hpRoll=cryptoRandom.int(4)+1;else if(k==="name")c.name=generateName(c.ancestryId);else{const s=form.elements.namedItem(k) as HTMLSelectElement|null;if(s){s.selectedIndex=cryptoRandom.int(s.options.length);s.dispatchEvent(new Event("change",{bubbles:true}));return}}autosave(c);editor(c.id)}))
 document.querySelector("#delete-character")?.addEventListener("click",()=>{if(confirm("Remove "+c.name+" from the ledger?")){store.deleteCharacter(c.id);state=store.getState();dirty=false;location.hash="#/"}})
}
function route(){const m=location.hash.match(/^#\/characters\/([^/]+)$/);m?editor(m[1]!):roster()}
window.addEventListener("hashchange",()=>{if(dirty&&!confirm("Discard your unsaved changes?")){history.forward();return}draft=undefined;dirty=false;route()})
window.addEventListener("beforeunload",e=>{if(dirty)e.preventDefault()})
if(!location.hash)location.hash="#/";else route()
