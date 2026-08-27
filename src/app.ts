import "./style.scss"
import { ABILITIES, type Ability, type CharacterRecordV1, type PaperSize } from "./types"
import { ANCESTRIES, BEASTKIN_ADAPTATIONS, CANTRIPS, COMMON_LANGUAGES, DRAGON_LINEAGES, DRAGON_TRAITS, EXOTIC_LANGUAGES, FOCUSES, OCCUPATIONS, POWERS, SHIFTER_FORMS, SKILLS, TIEFLING_TRAITS, TOOLS, TRINKETS, UNCOMMON_LANGUAGES, WARFORGED_SCARS, WEAPONS } from "./data"
import { createFunnelBatch, cryptoRandom, deriveCharacter, generateAncestryChoices, generateName, generateOccupationChoices, rollAbility, validateCharacter } from "./domain"
import { downloadCharacterPdf } from "./pdf"
import { createCharacterStore } from "./storage"

const root = document.querySelector<HTMLDivElement>("#app")!
const store = createCharacterStore()
let state = store.getState()
let selecting = false
let selected = new Set<string>()
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
 root.innerHTML=`<div class="site-shell"><header class="masthead"><a class="brand" href="#/"><span>Chronicles of</span><strong>Orrin</strong><em>Level-Zero Funnel</em></a><div class="sun-mark"></div></header>${store.warning?`<div class="warning" role="alert">${esc(store.warning)}</div>`:""}<main>${body}</main><footer>Made for the wastes · <a href="https://www.dndbeyond.com/srd" target="_blank" rel="noreferrer">SRD 5.1 · CC BY 4.0</a></footer></div>`
}
function stats(c:CharacterRecordV1){const d=deriveCharacter(c);return ABILITIES.map(a=>`<span><b>${a.toUpperCase()}</b> ${d.finalAbilities[a]}<small>${d.modifiers[a]>=0?"+":""}${d.modifiers[a]}</small></span>`).join("")}
function card(c:CharacterRecordV1){const d=deriveCharacter(c);return `<article class="character-card ${d.status}" data-open="${c.id}" tabindex="0">${selecting?`<label class="check"><input type="checkbox" data-select="${c.id}" ${selected.has(c.id)?"checked":""}> Select</label>`:""}<div class="card-top"><div><p class="status">${d.status}</p><h3>${esc(c.name)}</h3><p>${esc(d.ancestry.name)} · ${esc(d.occupation.name)}</p></div><div class="vital"><b>${d.maxHp}</b><span>HP</span></div></div><div class="stats">${stats(c)}</div><div class="card-foot"><span>AC <b>${d.armorClass}</b></span><span>Speed <b>${d.speed}</b></span><button class="icon-button" data-delete="${c.id}" aria-label="Delete">×</button></div></article>`}
function roster(){
 draft=undefined;dirty=false
 const groups=new Map<string,CharacterRecordV1[]>();for(const c of state.characters){const list=groups.get(c.batchId)??[];list.push(c);groups.set(c.batchId,list)}
 const batches=[...groups.values()].sort((a,b)=>b[0]!.createdAt.localeCompare(a[0]!.createdAt))
 shell(`<section class="hero-panel"><div class="hero-copy"><p class="eyebrow">Cast the bones. Face the dying sun.</p><h1>Who walks into<br><em>the wastes?</em></h1><p>Roll a company of four untested souls. The wastes may claim some before their story even begins.</p><button class="primary roll" id="roll-batch">◆ Roll 4 Characters</button></div><div class="hero-art" role="img" aria-label="Travelers crossing a desert"></div></section><section class="roster-head"><div><p class="eyebrow">Your roster</p><h2>${state.characters.length?state.characters.length+" Souls Recorded":"No Souls Recorded"}</h2></div>${state.characters.length?`<button class="secondary" id="print-toggle">${selecting?"Cancel Print":"Print Characters"}</button>`:""}</section>${selecting?`<div class="selection-bar"><strong>${selected.size} selected</strong><button id="select-all" class="text-button">Select all</button><button id="make-pdf" class="primary" ${selected.size?"":"disabled"}>Continue to print</button></div>`:""}${batches.map((cs,i)=>`<section class="batch"><div class="batch-label"><span>Company ${batches.length-i}</span><i></i></div><div class="cards">${cs.map(card).join("")}</div></section>`).join("")||`<section class="empty"><span class="empty-die">◇</span><h2>The ledger is empty</h2><p>Your first company waits on the other side of a single roll.</p></section>`}`)
 document.querySelector("#roll-batch")?.addEventListener("click",()=>{store.addCharacters(createFunnelBatch());state=store.getState();roster()})
 document.querySelector("#print-toggle")?.addEventListener("click",()=>{selecting=!selecting;selected.clear();roster()})
 document.querySelector("#select-all")?.addEventListener("click",()=>{selected=new Set(state.characters.map(c=>c.id));roster()})
 document.querySelectorAll<HTMLInputElement>("[data-select]").forEach(x=>x.addEventListener("click",e=>e.stopPropagation()))
 document.querySelectorAll<HTMLInputElement>("[data-select]").forEach(x=>x.addEventListener("change",()=>{x.checked?selected.add(x.dataset.select!):selected.delete(x.dataset.select!);roster()}))
 document.querySelectorAll<HTMLElement>("[data-open]").forEach(x=>{const open=(e:Event)=>{if((e.target as HTMLElement).closest("button,label,input"))return;location.hash="#/characters/"+x.dataset.open};x.addEventListener("click",open);x.addEventListener("keydown",e=>{if(e.key==="Enter")open(e)})})
 document.querySelectorAll<HTMLButtonElement>("[data-delete]").forEach(x=>x.addEventListener("click",e=>{e.stopPropagation();const c=state.characters.find(c=>c.id===x.dataset.delete);if(c&&confirm("Remove "+c.name+" from the ledger?")){store.deleteCharacter(c.id);state=store.getState();roster()}}))
 document.querySelector("#make-pdf")?.addEventListener("click",printDialog)
}
function printDialog(){
 const d=document.createElement("dialog");d.innerHTML=`<form method="dialog" class="print-dialog"><p class="eyebrow">Prepare the ledger</p><h2>Choose paper size</h2><label><input type="radio" name="paper" value="letter" ${state.paperSize==="letter"?"checked":""}> Letter <small>8.5 × 11 in</small></label><label><input type="radio" name="paper" value="a4" ${state.paperSize==="a4"?"checked":""}> A4 <small>210 × 297 mm</small></label><div><button value="cancel" class="secondary">Cancel</button><button value="confirm" class="primary">Download PDF</button></div></form>`;document.body.append(d);d.showModal();d.addEventListener("close",async()=>{if(d.returnValue==="confirm"){const paper=new FormData(d.querySelector("form")!).get("paper") as PaperSize;store.setPaperSize(paper);state=store.getState();await downloadCharacterPdf(state.characters.filter(c=>selected.has(c.id)),paper);selecting=false;selected.clear()}d.remove();roster()})
}
function field(name:string,label:string,value:string|number,type="number",reroll=false){return `<label class="field"><span>${label}</span><div><input name="${name}" type="${type}" value="${esc(value)}" ${type==="number"?"min=1 max=18":"maxlength=180"}>${reroll?`<button type="button" class="reroll" data-reroll="${name}">↻</button>`:""}</div></label>`}
function select(name:string,label:string,items:readonly (string|Opt)[],value?:string|number,reroll=true){return `<label class="field"><span>${label}</span><div><select name="${name}">${opts(items,value)}</select>${reroll?`<button type="button" class="reroll" data-reroll="${name}">↻</button>`:""}</div></label>`}
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
 if(!draft)return;const fd=new FormData(form);draft.name=String(fd.get("name")||"Nameless").slice(0,60);for(const a of ABILITIES)draft.rawAbilities[a]=Number(fd.get("ability-"+a));draft.hpRoll=Number(fd.get("hpRoll"));draft.trinketAnswer=String(fd.get("trinketAnswer")||"").slice(0,180)
 const ancestry=String(fd.get("ancestryId")),occupation=Number(fd.get("occupationId"));if(ancestry!==draft.ancestryId){draft.ancestryId=ancestry;draft.ancestryChoices=generateAncestryChoices(ancestry)}if(occupation!==draft.occupationId){draft.occupationId=occupation;draft.occupationChoices=generateOccupationChoices(occupation)}draft.trinketId=Number(fd.get("trinketId"))
 const a=draft.ancestryChoices,o=draft.occupationChoices;for(const key of ["tool","skill","weapon","cantrip","focus","adaptation","dragonLineage","secondaryDragonLineage","shift","scar"] as const)if(fd.has(key))a[key]=String(fd.get(key));if(fd.has("abilityBoost"))a.abilityBoost=String(fd.get("abilityBoost")) as Ability;if(fd.has("language1"))a.languages=[String(fd.get("language1")),String(fd.get("language2"))];if(fd.has("ancestryTraits"))a.traits=fd.getAll("ancestryTraits").map(String);if(fd.has("occupationCantrip"))o.cantrip=String(fd.get("occupationCantrip"));if(fd.has("power"))o.power=String(fd.get("power"));dirty=true
}
function editor(id:string){
 const original=state.characters.find(c=>c.id===id);if(!original){location.hash="#/";return}if(!draft||draft.id!==id)draft=structuredClone(original);const c=draft,d=deriveCharacter(c),errors=validateCharacter(c)
 shell(`<div class="editor-head"><a href="#/" class="back">← Return to roster</a><p class="eyebrow">Level-zero record</p><h1>${esc(c.name)}</h1><p class="status-line ${d.status}">${d.status} · ${esc(d.ancestry.name)} · ${esc(d.occupation.name)}</p></div><form id="character-form"><section class="sheet-grid"><div><div class="panel"><h2>Identity</h2><div class="form-grid">${field("name","Name",c.name,"text",true)}${select("ancestryId","Ancestry",ANCESTRIES,c.ancestryId)}${select("occupationId","Occupation",OCCUPATIONS,c.occupationId)}${select("trinketId","Trinket",TRINKETS,c.trinketId)}</div>${field("trinketAnswer","Trinket answer / detail",c.trinketAnswer,"text")}</div><div class="panel"><h2>Raw ability rolls</h2><p>4d6, drop the lowest. Ancestry increases appear in the final record.</p><div class="ability-fields">${ABILITIES.map(a=>field("ability-"+a,a.toUpperCase(),c.rawAbilities[a],"number",true)).join("")}</div></div><div class="panel"><h2>Life & choices</h2><div class="form-grid">${field("hpRoll","Hit point d4",c.hpRoll,"number",true)}${choices(c)}</div></div></div><aside class="derived panel ${d.status}"><p class="eyebrow">Calculated record</p><div class="big-vitals"><span><b>${d.maxHp}</b> HP</span><span><b>${d.armorClass}</b> AC</span></div><div class="stats large">${stats(c)}</div><dl><dt>Status</dt><dd>${title(d.status)}</dd><dt>Speed / size</dt><dd>${d.speed} ft · ${d.size}</dd><dt>Hit dice</dt><dd>${d.hitDice}</dd><dt>Languages</dt><dd>${esc(d.languages.join(", "))}</dd><dt>Proficiencies</dt><dd>${esc(d.proficiencies.join(", ")||"None")}</dd><dt>Gear</dt><dd>${esc(d.gear.join(", ")||"None")}</dd></dl></aside></section>${errors.length?`<div class="validation" role="alert">${errors.map(x=>"<p>"+esc(x)+"</p>").join("")}</div>`:""}<div class="editor-actions"><button type="button" id="delete-character" class="danger">Delete</button><div><a href="#/" class="secondary button">Cancel</a><button class="primary" ${errors.length?"disabled":""}>Save Character</button></div></div></form>`)
 const form=document.querySelector<HTMLFormElement>("#character-form")!;form.addEventListener("change",e=>{sync(form);if((e.target as HTMLInputElement).type!=="text")editor(c.id)});form.addEventListener("input",()=>{sync(form)})
 form.addEventListener("submit",e=>{e.preventDefault();sync(form);if(validateCharacter(c).length){editor(c.id);return}c.updatedAt=new Date().toISOString();store.updateCharacter(c);state=store.getState();dirty=false;location.hash="#/";roster()})
 document.querySelectorAll<HTMLButtonElement>("[data-reroll]").forEach(b=>b.addEventListener("click",()=>{sync(form);const k=b.dataset.reroll!;if(k.startsWith("ability-"))c.rawAbilities[k.slice(8) as Ability]=rollAbility();else if(k==="hpRoll")c.hpRoll=cryptoRandom.int(4)+1;else if(k==="name")c.name=generateName(c.ancestryId);else{const s=form.elements.namedItem(k) as HTMLSelectElement|null;if(s){s.selectedIndex=cryptoRandom.int(s.options.length);s.dispatchEvent(new Event("change",{bubbles:true}));return}}dirty=true;editor(c.id)}))
 document.querySelector("#delete-character")?.addEventListener("click",()=>{if(confirm("Remove "+c.name+" from the ledger?")){store.deleteCharacter(c.id);state=store.getState();dirty=false;location.hash="#/"}})
}
function route(){const m=location.hash.match(/^#\/characters\/([^/]+)$/);m?editor(m[1]!):roster()}
window.addEventListener("hashchange",()=>{if(dirty&&!confirm("Discard your unsaved changes?")){history.forward();return}draft=undefined;dirty=false;route()})
window.addEventListener("beforeunload",e=>{if(dirty)e.preventDefault()})
if(!location.hash)location.hash="#/";else route()
