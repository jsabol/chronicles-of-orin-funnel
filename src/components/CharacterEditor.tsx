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
  generateName,
  generateOccupationChoices,
  validateCharacter,
} from "../domain";
import { asset, store } from "../app-store";
import { SelectField, TextField, TrinketField } from "./FormFields";
import styles from "./CharacterEditor.module.scss";

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
const sortedOccupations = [...OCCUPATIONS].sort((a, b) =>
  a.name.localeCompare(b.name)
);
const sortedAncestries = [...ANCESTRIES].sort((a, b) =>
  a.name.localeCompare(b.name)
);
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
    <fieldset className={styles.traitPicker}>
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
      className={styles.deleteDialog}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <p className={styles.eyebrow}>Final warning</p>
      <h2>Delete {name}?</h2>
      <p>
        You can mark them <strong>Fallen</strong> under{" "}
        <strong>Life & Choices</strong>
        &nbsp;instead.
      </p>
      <div>
        <button type="button" className={styles.secondary} onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className={styles.deleteAction}
          onClick={onConfirm}
        >
          <span className={styles.trashIcon} aria-hidden="true" />
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
      <div className={styles.editorHead}>
        <div className={styles.editorHeadActions}>
          <a href="#/" className={styles.back}>
            ← Return to roster
          </a>
          <button
            type="button"
            className={styles.deleteAction}
            onClick={() => setConfirmingDelete(true)}
          >
            <span className={styles.trashIcon} aria-hidden="true" />
            Eliminate
          </button>
        </div>
        <h1 className={`${styles.characterName} ${styles[d.status]}`}>
          {d.status === "fallen" && (
            <img
              className={styles.fallenIcon}
              src={asset("fallen-mark.webp")}
              alt=""
            />
          )}
          {draft.name}
        </h1>
        <p className={`${styles.statusLine} ${styles[d.status]}`}>
          {d.status} · {d.ancestry.name} · {d.occupation.name}
        </p>
        {d.status === "fallen" && (
          <p className={styles.causeOfDeath}>
            <strong>Cause of death:</strong>{" "}
            <em>{draft.causeOfDeath || "Not recorded"}</em>
          </p>
        )}
      </div>
      <form
        id="character-form"
        className={styles.form}
        autoComplete="off"
        onSubmit={(e) => e.preventDefault()}
      >
        {errors.length > 0 && (
          <div className={styles.validation} role="alert">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}
        <section className={styles.sheetGrid}>
          <div>
            <div className={styles.panel}>
              <h2>Identity</h2>
              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>Name</span>
                  <div>
                    <input
                      type="text"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      value={draft.name}
                      maxLength={60}
                      onChange={(event) =>
                        save((c) => {
                          c.name = event.target.value;
                        })
                      }
                    />
                    <button
                      type="button"
                      className={styles.reroll}
                      onClick={() =>
                        save((c) => {
                          c.name = generateName(c.ancestryId);
                        })
                      }
                      aria-label="Generate a new random name"
                      title="Generate a new random name"
                    >
                      <img src={asset("arrow-rotate-right-solid.svg")} alt="" />
                    </button>
                  </div>
                </label>
                <SelectField
                  label="Ancestry"
                  value={draft.ancestryId}
                  options={sortedAncestries}
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
                  options={sortedOccupations}
                  onChange={(v) =>
                    save((c) => {
                      c.occupationId = Number(v);
                      c.occupationChoices = generateOccupationChoices(
                        Number(v)
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
            <div className={styles.panel}>
              <div className={styles.panelTitleRow}>
                <h2 className={styles.panelTitle}>Life & choices</h2>
                <span className={styles.hpRoll}>
                  HP d4 Result: {draft.hpRoll}
                </span>
              </div>
              <div className={styles.formGrid}>
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
            <div className={styles.panel}>
              <h2>Raw ability rolls</h2>
              <p>
                4d6, drop the lowest. Ancestry increases appear in the final
                record.
              </p>
              <div className={styles.abilityFields}>
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
      id: "rune-target",
      name: "Rune Target",
      summary: record.ancestryChoices.runeTarget,
    });
  const nonSkills = d.proficiencies.filter(
    (item) => !SKILLS.includes(item as (typeof SKILLS)[number])
  );
  return (
    <aside className={`${styles.derived} ${styles.panel} ${styles[d.status]}`}>
      <p className={styles.eyebrow}>Calculated record</p>
      <div className={styles.bigVitals}>
        <span>
          <b>{d.maxHp}</b> HP
        </span>
        <span>
          <b>{d.armorClass}</b> AC
        </span>
      </div>
      <div className={styles.stats}>
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
      <section className={styles.improvisedWeapon}>
        <h2>Improvised Weapon</h2>
        <p className={styles.improvisedWeaponStats}>
          <strong>1d4 damage</strong> · Thrown (20/60 ft.)
        </p>
        <p className={styles.improvisedWeaponNote}>
          The GM chooses a damage type appropriate to the object. No proficiency
          applies unless it resembles a weapon the character is proficient with.
        </p>
      </section>
      {visibleTraits.length > 0 && (
        <section className={styles.ancestryFeatures}>
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
        <section className={styles.recordMagic}>
          <h2>Magic & Powers</h2>
          <ul>
            {d.magic.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}{" "}
      <section className={styles.calculatedSkills}>
        <h2>Skills</h2>
        <ul>
          {SKILLS.map((skill) => {
            const proficient = d.proficiencies.includes(skill);
            const value =
              d.modifiers[skillAbilities[skill]] +
              (proficient ? d.proficiencyBonus : 0);
            return (
              <li
                key={skill}
                className={proficient ? styles.proficient : undefined}
              >
                <span>
                  <span
                    className={proficient ? styles.proficientMark : undefined}
                  >
                    {proficient ? "◆" : "◇"}
                  </span>{" "}
                  {skill}
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
