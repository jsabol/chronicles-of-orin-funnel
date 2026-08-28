import { useEffect, useMemo, useRef, useState } from "react";
import type { CharacterRecordV1, PaperSize } from "../types";
import { createFunnelBatch, cryptoRandom, deriveCharacter } from "../domain";
import { downloadCharacterPdf } from "../pdf";
import { asset, store } from "../app-store";
import styles from "./Roster.module.scss";

type Filter = "all" | "living" | "fallen";
function CharacterCard({
  character,
  selecting,
  selected,
  onToggle,
  onOpen,
}: {
  character: CharacterRecordV1;
  selecting: boolean;
  selected: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const derived = deriveCharacter(character);
  return (
    <article
      className={`${styles.characterCard} ${styles[derived.status]}`}
      data-testid="character-card"
      tabIndex={0}
      onClick={selecting ? onToggle : onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter") selecting ? onToggle() : onOpen();
      }}
    >
      {selecting && (
        <label className={styles.check} onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            data-select={character.id}
            checked={selected}
            onChange={onToggle}
          />
          <span>Select</span>
        </label>
      )}
      <div className={styles.fateCopy}>
        <h3
          className={`${styles.fateTitle} ${derived.status === "fallen" ? styles.fallenFateTitle : ""}`}
        >
          {character.name}
        </h3>
        <p className={styles.fateDescription}>
          {derived.ancestry.name}{" "}
          <i className={styles.fateDescriptionSeparator}>◆</i>{" "}
          {derived.occupation.name}
        </p>
        {derived.status === "fallen" && character.causeOfDeath && (
          <p className={styles.deathCause}>{character.causeOfDeath}</p>
        )}
        <div className={styles.fateVitals}>
          <span className={styles.hp}>{derived.maxHp} HP</span>
          <span className={`${styles.def} ${styles.fateVitalSecondary}`}>
            {derived.armorClass} DEF
          </span>
        </div>
      </div>
      <div className={styles.fateSeal}>
        <img
          className={styles.fateSealImage}
          src={asset(
            derived.status === "living"
              ? "living-sun.webp"
              : "fallen-mark.webp",
          )}
          alt=""
        />
        <strong
          className={`${styles.fateSealLabel} ${derived.status === "fallen" ? styles.fallenFateSealLabel : ""}`}
        >
          {derived.status === "living" ? "Living" : "Fallen"}
        </strong>
      </div>
    </article>
  );
}

function PrintDialog({
  paper,
  onCancel,
  onConfirm,
}: {
  paper: PaperSize;
  onCancel: () => void;
  onConfirm: (paper: PaperSize) => void;
}) {
  const [choice, setChoice] = useState<PaperSize>(paper);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
    return () => dialog.current?.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className={styles.printDialog}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <p className={styles.eyebrow}>Prepare the ledger</p>
      <h2 className={styles.printDialogTitle}>Choose paper size</h2>
      <label className={styles.printOption}>
        <input
          type="radio"
          checked={choice === "letter"}
          onChange={() => setChoice("letter")}
        />{" "}
        Letter <small className={styles.printOptionSize}>8.5 × 11 in</small>
      </label>
      <label className={styles.printOption}>
        <input
          type="radio"
          checked={choice === "a4"}
          onChange={() => setChoice("a4")}
        />{" "}
        A4 <small className={styles.printOptionSize}>210 × 297 mm</small>
      </label>
      <div className={styles.printDialogActions}>
        <button type="button" className={styles.secondary} onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className={styles.primary}
          onClick={() => onConfirm(choice)}
        >
          Download PDF
        </button>
      </div>
    </dialog>
  );
}

export function Roster({
  state,
  refresh,
}: {
  state: ReturnType<typeof store.getState>;
  refresh: () => void;
}) {
  const [filter, setFilter] = useState<Filter>("all"),
    [selecting, setSelecting] = useState(false),
    [selected, setSelected] = useState<Set<string>>(new Set()),
    [deleting, setDeleting] = useState(false),
    [printing, setPrinting] = useState(false);
  const rollCount = Math.max(4 - state.characters.length, 1);
  const ordered = useMemo(
    () =>
      [...state.characters].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      ),
    [state.characters],
  );
  const visible = ordered.filter(
    (c) => filter === "all" || deriveCharacter(c).status === filter,
  );
  const roll = () => {
    store.addCharacters(createFunnelBatch(cryptoRandom, rollCount));
    refresh();
  };
  const toggle = (id: string) =>
    setSelected((previous) => {
      const next = new Set(previous);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const endSelection = () => {
    setSelecting(false);
    setSelected(new Set());
  };
  const endDeletion = () => {
    setDeleting(false);
    setSelected(new Set());
  };
  const confirmDeletion = () => {
    store.deleteCharacters([...selected]);
    endDeletion();
    refresh();
  };
  const print = async (paper: PaperSize) => {
    store.setPaperSize(paper);
    await downloadCharacterPdf(
      state.characters.filter((c) => selected.has(c.id)),
      paper,
    );
    endSelection();
    refresh();
  };
  return (
    <>
      <section className={styles.doomHero}>
        <div className={styles.doomCopy}>
          <p className={`${styles.eyebrow} ${styles.doomCopyEyebrow}`}>
            Level-zero company
          </p>
          <h1 className={styles.doomCopyTitle}>The Doomed</h1>
          <p className={styles.doomCopyCount}>
            <b className={styles.doomCopyCountNumber}>
              {state.characters.length}
            </b>{" "}
            {state.characters.length === 1 ? "character" : "characters"}
          </p>
          <span className={styles.doomRule}>◇—☠—◇</span>
        </div>
      </section>
      <section className={styles.funnelActions}>
        <button
          className={`${styles.primary} ${styles.funnelAction} ${styles.funnelPrimaryAction}`}
          onClick={roll}
        >
          <span
            className={`${styles.actionIcon} ${styles.rollIcon}`}
            aria-hidden="true"
          />
          <span>
            Roll {rollCount === 1 ? "One Wretch" : `${rollCount} Wretches`}
          </span>
        </button>
        <button
          className={`${styles.secondary} ${styles.funnelAction}`}
          disabled={!state.characters.length}
          onClick={() => (selecting ? endSelection() : setSelecting(true))}
        >
          <span
            className={`${styles.actionIcon} ${styles.printIcon}`}
            aria-hidden="true"
          />
          <span>
            {selecting ? "Cancel the Casting" : "Cast Them Into the Funnel"}
          </span>
        </button>
      </section>
      <section className={styles.fates}>
        <div className={styles.sectionTitle}>
          <i className={styles.sectionTitleRule} />
          <h2 className={styles.sectionTitleHeading}>Recorded Fates</h2>
          <i
            className={`${styles.sectionTitleRule} ${styles.sectionTitleRuleEnd}`}
          />
        </div>
        <nav className={styles.fateFilters} aria-label="Filter recorded fates">
          {(["all", "living", "fallen"] as Filter[]).map((value) => (
            <button
              key={value}
              className={`${styles.filterButton} ${filter === value ? styles.active : ""}`}
              onClick={() => setFilter(value)}
            >
              {value === "fallen"
                ? "☠ Fallen"
                : `◇ ${value === "all" ? "All" : "Living"}`}
            </button>
          ))}
        </nav>
        {selecting && (
          <div className={styles.selectionBar}>
            <strong>{selected.size} marked</strong>
            <button
              className={styles.textButton}
              onClick={() =>
                setSelected(new Set(state.characters.map((c) => c.id)))
              }
            >
              Mark all
            </button>
            <button
              className={`${styles.primary} ${styles.selectionAction}`}
              disabled={!selected.size}
              onClick={() => setPrinting(true)}
            >
              Prepare the Funnel
            </button>
          </div>
        )}
        <div className={styles.cards}>
          {visible.map((c) => (
            <CharacterCard
              key={c.id}
              character={c}
              selecting={selecting || deleting}
              selected={selected.has(c.id)}
              onToggle={() => toggle(c.id)}
              onOpen={() => {
                location.hash = `#/characters/${c.id}`;
                requestAnimationFrame(() =>
                  window.scrollTo({ top: 0, behavior: "smooth" }),
                );
              }}
            />
          ))}
        </div>
        {!state.characters.length ? (
          <section className={styles.empty}>
            <span className={styles.emptyDie}>◇</span>
            <h2 className={styles.emptyTitle}>No fates recorded</h2>
            <p>Roll four wretches and see who survives the first breath.</p>
          </section>
        ) : (
          !visible.length && (
            <section className={styles.empty}>
              <h2 className={styles.emptyTitle}>
                No {filter === "living" ? "living souls" : "fallen souls"}
              </h2>
            </section>
          )
        )}
        {state.characters.length > 0 && !selecting && (
          <div className={styles.deletionActions}>
            <button
              className={styles.deleteAction}
              disabled={deleting && selected.size === 0}
              onClick={() => (deleting ? confirmDeletion() : setDeleting(true))}
            >
              <span className={styles.trashIcon} aria-hidden="true" />
              <span>
                {deleting
                  ? `Confirm delete ${selected.size}`
                  : "Mass elimination"}
              </span>
            </button>
            {deleting && (
              <button
                className={`${styles.secondary} ${styles.deletionSecondary}`}
                onClick={endDeletion}
              >
                Cancel deletion
              </button>
            )}
          </div>
        )}
      </section>
      {printing && (
        <PrintDialog
          paper={state.paperSize}
          onCancel={() => setPrinting(false)}
          onConfirm={print}
        />
      )}
    </>
  );
}
