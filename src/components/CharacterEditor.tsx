import { useEffect, useRef, useState, type ReactNode } from "react";
import { ABILITIES, type Ability, type CharacterRecordV1 } from "../types";
import {
  ANCESTRIES,
  BEASTKIN_ADAPTATIONS,
  CANTRIPS,
  COMMON_LANGUAGES,
  DRAGON_LINEAGES,
  DRAGON_TRAITS,
  EXOTIC_LANGUAGES,
  FOCUSES,
  OCCUPATIONS,
  POWERS,
  SHIFTER_FORMS,
  SKILLS,
  TIEFLING_TRAITS,
  TOOLS,
  UNCOMMON_LANGUAGES,
  WARFORGED_SCARS,
  WEAPONS,
} from "../data";
import {
  deriveCharacter,
  generateAncestryChoices,
  generateOccupationChoices,
  validateCharacter,
} from "../domain";
import { asset, store } from "../app-store";
import { SelectField, TextField, TrinketField } from "./FormFields";

type Option = {
  id: string | number;
  name?: string;
  text?: string;
  points?: number;
};
const languages = [
  ...COMMON_LANGUAGES,
  ...UNCOMMON_LANGUAGES,
  ...EXOTIC_LANGUAGES,
];
const skillAbilities: Record<string, Ability> = {
  Acrobatics: "dex",
  "Animal Handling": "wis",
  Arcana: "int",
  Athletics: "str",
  Deception: "cha",
  History: "int",
  Insight: "wis",
  Intimidation: "cha",
  Investigation: "int",
  Medicine: "wis",
  Nature: "int",
  Perception: "wis",
  Performance: "cha",
  Persuasion: "cha",
  Religion: "int",
  "Sleight of Hand": "dex",
  Stealth: "dex",
  Survival: "wis",
};
const foldedTraits = new Set([
  "tool",
  "skilled",
  "staying-power",
  "keen",
  "wild",
  "instinct",
  "fleet-stride",
  "tough-hide",
  "design",
  "menacing",
  "beast-legs",
]);
function TraitPicker({
  options,
  chosen,
  onChange,
}: {
  options: readonly Option[];
  chosen: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <fieldset className="trait-picker">
      <legend>Ancestry traits · exactly 3 points</legend>
      {options.map((option) => (
        <label key={String(option.id)}>
          <input
            type="checkbox"
            checked={chosen.includes(String(option.id))}
            onChange={() =>
              onChange(
                chosen.includes(String(option.id))
                  ? chosen.filter((x) => x !== String(option.id))
                  : [...chosen, String(option.id)],
              )
            }
          />
          <span>
            {option.name} <b>{option.points}</b>
          </span>
        </label>
      ))}
    </fieldset>
  );
}

function DeleteDialog({
  name,
  onCancel,
  onConfirm,
}: {
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
    return () => dialog.current?.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="delete-dialog"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <p className="eyebrow">Final warning</p>
      <h2>Eliminate character?</h2>
      <p>
        Are you sure you want to delete <strong>{name}</strong>?
      </p>
      <div>
        <button type="button" className="secondary" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="danger delete-action"
          onClick={onConfirm}
        >
          <span className="trash-icon" aria-hidden="true" />
          Eliminate
        </button>
      </div>
    </dialog>
  );
}
export function Editor({
  id,
  state,
  refresh,
}: {
  id: string;
  state: ReturnType<typeof store.getState>;
  refresh: () => void;
}) {
  const original = state.characters.find((c) => c.id === id);
  const [draft, setDraft] = useState<CharacterRecordV1 | null>(
    original ? structuredClone(original) : null,
  );
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  useEffect(() => setDraft(original ? structuredClone(original) : null), [id]);
  if (!draft) return <p>Character not found.</p>;
  const save = (change: (record: CharacterRecordV1) => void) => {
    const next = structuredClone(draft);
    change(next);
    next.updatedAt = new Date().toISOString();
    setDraft(next);
    store.updateCharacter(next);
    refresh();
  };
  const d = deriveCharacter(draft),
    errors = validateCharacter(draft),
    choices = draft.ancestryChoices,
    occupationChoices = draft.occupationChoices;
  const setChoice = (key: keyof typeof choices, value: string) =>
    save((c) => {
      (c.ancestryChoices as Record<string, unknown>)[key] = value;
    });
  const dependent: ReactNode[] = [];
  if (["human", "warforged"].includes(draft.ancestryId))
    dependent.push(
      <SelectField
        key="boost"
        label="Ability increase"
        value={choices.abilityBoost}
        options={ABILITIES}
        onChange={(v) => setChoice("abilityBoost", v)}
      />,
    );
  if (draft.ancestryId === "human")
    dependent.push(
      <SelectField
        key="lang1"
        label="Extra language I"
        value={choices.languages?.[0]}
        options={languages}
        onChange={(v) =>
          save((c) => {
            c.ancestryChoices.languages = [
              v,
              c.ancestryChoices.languages?.[1] ?? v,
            ];
          })
        }
      />,
      <SelectField
        key="lang2"
        label="Extra language II"
        value={choices.languages?.[1]}
        options={languages}
        onChange={(v) =>
          save((c) => {
            c.ancestryChoices.languages = [
              c.ancestryChoices.languages?.[0] ?? v,
              v,
            ];
          })
        }
      />,
    );
  if (["deep-dwarf", "sand-dwarf"].includes(draft.ancestryId))
    dependent.push(
      <SelectField
        key="tool"
        label="Tool training"
        value={choices.tool}
        options={TOOLS}
        onChange={(v) => setChoice("tool", v)}
      />,
    );
  if (draft.ancestryId === "smallfolk")
    dependent.push(
      <SelectField
        key="focus"
        label="Focus"
        value={choices.focus}
        options={FOCUSES}
        onChange={(v) => setChoice("focus", v)}
      />,
    );
  if (draft.ancestryId === "sun-elf")
    dependent.push(
      <SelectField
        key="cantrip"
        label="Cantrip"
        value={choices.cantrip}
        options={CANTRIPS}
        onChange={(v) => setChoice("cantrip", v)}
      />,
      <SelectField
        key="weapon"
        label="Weapon training"
        value={choices.weapon}
        options={WEAPONS}
        onChange={(v) => setChoice("weapon", v)}
      />,
    );
  if (draft.ancestryId === "beastkin")
    dependent.push(
      <SelectField
        key="adaptation"
        label="Adaptation"
        value={choices.adaptation}
        options={BEASTKIN_ADAPTATIONS}
        onChange={(v) => setChoice("adaptation", v)}
      />,
    );
  if (draft.ancestryId === "dragonkin")
    dependent.push(
      <SelectField
        key="dragon"
        label="Primary lineage"
        value={choices.dragonLineage}
        options={DRAGON_LINEAGES.map((x) => x.name)}
        onChange={(v) => setChoice("dragonLineage", v)}
      />,
      <SelectField
        key="dragon2"
        label="Secondary lineage"
        value={choices.secondaryDragonLineage}
        options={DRAGON_LINEAGES.map((x) => x.name)}
        onChange={(v) => setChoice("secondaryDragonLineage", v)}
      />,
      <TraitPicker
        key="traits"
        options={DRAGON_TRAITS}
        chosen={choices.traits ?? []}
        onChange={(v) =>
          save((c) => {
            c.ancestryChoices.traits = v;
          })
        }
      />,
    );
  if (draft.ancestryId === "shifter")
    dependent.push(
      <SelectField
        key="shift"
        label="Shifting form"
        value={choices.shift}
        options={SHIFTER_FORMS}
        onChange={(v) => setChoice("shift", v)}
      />,
    );
  if (draft.ancestryId === "warforged")
    dependent.push(
      <SelectField
        key="skill"
        label="Skill"
        value={choices.skill}
        options={SKILLS}
        onChange={(v) => setChoice("skill", v)}
      />,
      <SelectField
        key="tool"
        label="Tool"
        value={choices.tool}
        options={TOOLS}
        onChange={(v) => setChoice("tool", v)}
      />,
      <SelectField
        key="scar"
        label="Damage scar"
        value={choices.scar}
        options={WARFORGED_SCARS}
        onChange={(v) => setChoice("scar", v)}
      />,
    );
  if (draft.ancestryId === "tiefling")
    dependent.push(
      <TraitPicker
        key="traits"
        options={TIEFLING_TRAITS}
        chosen={choices.traits ?? []}
        onChange={(v) =>
          save((c) => {
            c.ancestryChoices.traits = v;
          })
        }
      />,
    );
  if (draft.ancestryId === "wode-elf")
    dependent.push(
      <SelectField
        key="weapon"
        label="Weapon training"
        value={choices.weapon}
        options={WEAPONS}
        onChange={(v) => setChoice("weapon", v)}
      />,
    );
  if (d.occupation.special === "cantrip")
    dependent.push(
      <SelectField
        key="occ-cantrip"
        label="Occupation cantrip"
        value={occupationChoices.cantrip}
        options={CANTRIPS}
        onChange={(v) =>
          save((c) => {
            c.occupationChoices.cantrip = v;
          })
        }
      />,
    );
  if (d.occupation.special === "power")
    dependent.push(
      <SelectField
        key="power"
        label="Rogue talent"
        value={occupationChoices.power}
        options={POWERS}
        onChange={(v) =>
          save((c) => {
            c.occupationChoices.power = v;
          })
        }
      />,
    );
  return (
    <>
      <div className="editor-head">
        <div className="editor-head-actions">
          <a href="#/" className="back">
            ← Return to roster
          </a>
          <button
            type="button"
            className="danger delete-action"
            onClick={() => setConfirmingDelete(true)}
          >
            <span className="trash-icon" aria-hidden="true" />
            Eliminate
          </button>
        </div>
        <p className="eyebrow">Level-zero record</p>
        <h1 className="character-name">
          {draft.name}
          {d.status === "fallen" && (
            <img
              className="fallen-icon"
              src={asset("fallen-mark.webp")}
              alt=""
            />
          )}
        </h1>
        <p className={`status-line ${d.status}`}>
          {d.status} · {d.ancestry.name} · {d.occupation.name}
        </p>
      </div>
      <form id="character-form" onSubmit={(e) => e.preventDefault()}>
        {errors.length > 0 && (
          <div className="validation" role="alert">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}
        <section className="sheet-grid">
          <div>
            <div className="panel">
              <h2>Identity</h2>
              <div className="form-grid">
                <TextField
                  label="Name"
                  value={draft.name}
                  onChange={(v) =>
                    save((c) => {
                      c.name = v.slice(0, 60);
                    })
                  }
                />
                <SelectField
                  label="Ancestry"
                  value={draft.ancestryId}
                  options={ANCESTRIES}
                  onChange={(v) =>
                    save((c) => {
                      c.ancestryId = v;
                      c.ancestryChoices = generateAncestryChoices(v);
                    })
                  }
                />
                <SelectField
                  label="Occupation"
                  value={draft.occupationId}
                  options={OCCUPATIONS}
                  onChange={(v) =>
                    save((c) => {
                      c.occupationId = Number(v);
                      c.occupationChoices = generateOccupationChoices(
                        Number(v),
                      );
                    })
                  }
                />
                <TrinketField
                  value={draft.trinketId}
                  onChange={(v) =>
                    save((c) => {
                      c.trinketId = Number(v);
                    })
                  }
                />
              </div>
            </div>
            <div className="panel">
              <h2>Life & choices</h2>
              <div className="form-grid">
                <TextField
                  label="Hit point d4"
                  value={draft.hpRoll}
                  type="number"
                  readOnly
                />
                <SelectField
                  label="Fate"
                  value={d.status}
                  options={[
                    { id: "living", name: "Living" },
                    { id: "fallen", name: "Fallen" },
                  ]}
                  onChange={(v) =>
                    save((c) => {
                      c.fateOverride = v as "living" | "fallen";
                      if (v === "living") c.causeOfDeath = "";
                    })
                  }
                />
                {d.status === "fallen" && (
                  <TextField
                    label="Cause of death"
                    value={draft.causeOfDeath ?? ""}
                    onChange={(v) =>
                      save((c) => {
                        c.causeOfDeath = v.slice(0, 120);
                      })
                    }
                  />
                )}
                {dependent}
              </div>
            </div>
            <div className="panel">
              <h2>Raw ability rolls</h2>
              <p>
                4d6, drop the lowest. Ancestry increases appear in the final
                record.
              </p>
              <div className="ability-fields">
                {ABILITIES.map((ability) => (
                  <TextField
                    key={ability}
                    label={ability.toUpperCase()}
                    value={draft.rawAbilities[ability]}
                    type="number"
                    onChange={(v) =>
                      save((c) => {
                        c.rawAbilities[ability] = Number(v);
                      })
                    }
                  />
                ))}
              </div>
            </div>
          </div>
          <Derived record={draft} />
        </section>
      </form>
      {confirmingDelete && (
        <DeleteDialog
          name={draft.name}
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={() => {
            store.deleteCharacter(draft.id);
            setConfirmingDelete(false);
            refresh();
            location.hash = "#/";
          }}
        />
      )}
    </>
  );
}
function Derived({ record }: { record: CharacterRecordV1 }) {
  const d = deriveCharacter(record);
  const visibleTraits = d.traits.filter((t) => !foldedTraits.has(t.id));
  if (record.ancestryChoices.focus)
    visibleTraits.push({
      id: "focus",
      name: "Focus",
      summary: record.ancestryChoices.focus,
    });
  if (record.ancestryChoices.runeTarget)
    visibleTraits.push({
      id: "rune",
      name: "Rune Target",
      summary: record.ancestryChoices.runeTarget,
    });
  const nonSkills = d.proficiencies.filter(
    (item) => !SKILLS.includes(item as (typeof SKILLS)[number]),
  );
  return (
    <aside className={`derived panel ${d.status}`}>
      <p className="eyebrow">Calculated record</p>
      <div className="big-vitals">
        <span>
          <b>{d.maxHp}</b> HP
        </span>
        <span>
          <b>{d.armorClass}</b> AC
        </span>
      </div>
      <div className="stats large">
        {ABILITIES.map((a) => (
          <span key={a}>
            <b>{a.toUpperCase()}</b> {d.finalAbilities[a]}
            <small>
              {d.modifiers[a] >= 0 ? "+" : ""}
              {d.modifiers[a]}
            </small>
          </span>
        ))}
      </div>
      <dl>
        <dt>Speed / size</dt>
        <dd>
          {d.speed} ft · {d.size}
        </dd>
        <dt>Hit dice</dt>
        <dd>{d.hitDice}</dd>
        <dt>Languages</dt>
        <dd>{d.languages.join(", ")}</dd>
        <dt>Proficiencies</dt>
        <dd>{nonSkills.join(", ") || "None"}</dd>
        <dt>Gear</dt>
        <dd>{d.gear.join(", ") || "None"}</dd>
      </dl>
      {visibleTraits.length > 0 && (
        <section className="ancestry-features">
          <h2>Ancestry Features</h2>
          <ul>
            {visibleTraits.map((t) => (
              <li key={t.id}>
                <strong>{t.name}</strong>
                <span>{t.summary}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {d.magic.length > 0 && (
        <section className="record-magic">
          <h2>Magic & Powers</h2>
          <ul>
            {d.magic.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}{" "}
      <section className="calculated-skills">
        <h2>Skills</h2>
        <ul>
          {SKILLS.map((skill) => {
            const proficient = d.proficiencies.includes(skill);
            const value =
              d.modifiers[skillAbilities[skill]] +
              (proficient ? d.proficiencyBonus : 0);
            return (
              <li key={skill} className={proficient ? "proficient" : ""}>
                <span>
                  {proficient ? "◆" : "◇"} {skill}
                </span>
                <b>
                  {value >= 0 ? "+" : ""}
                  {value}
                </b>
              </li>
            );
          })}
        </ul>
      </section>
    </aside>
  );
}
