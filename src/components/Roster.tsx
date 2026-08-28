import { useEffect, useMemo, useRef, useState } from "react";
import type { CharacterRecordV1, PaperSize } from "../types";
import { createFunnelBatch, cryptoRandom, deriveCharacter } from "../domain";
import { downloadCharacterPdf } from "../pdf";
import { asset, store } from "../app-store";

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
      className={`character-card ${derived.status}`}
      tabIndex={0}
      onClick={selecting ? onToggle : onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter") selecting ? onToggle() : onOpen();
      }}
    >
      {selecting && (
        <label className="check" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            data-select={character.id}
            checked={selected}
            onChange={onToggle}
          />
          <span>Select</span>
        </label>
      )}
      <div className="fate-copy">
        <h3>{character.name}</h3>
        <p>
          {derived.ancestry.name} <i>◆</i> {derived.occupation.name}
        </p>
        {derived.status === "fallen" && character.causeOfDeath && (
          <p className="death-cause">{character.causeOfDeath}</p>
        )}
        <div className="fate-vitals">
          <span className="hp">{derived.maxHp} HP</span>
          <span className="def">{derived.armorClass} DEF</span>
        </div>
      </div>
      <div className="fate-seal">
        <img
          src={asset(
            derived.status === "living"
              ? "living-sun.webp"
              : "fallen-mark.webp",
          )}
          alt=""
        />
        <strong>{derived.status === "living" ? "Living" : "Fallen"}</strong>
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
      className="print-dialog"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <p className="eyebrow">Prepare the ledger</p>
      <h2>Choose paper size</h2>
      <label>
        <input
          type="radio"
          checked={choice === "letter"}
          onChange={() => setChoice("letter")}
        />{" "}
        Letter <small>8.5 × 11 in</small>
      </label>
      <label>
        <input
          type="radio"
          checked={choice === "a4"}
          onChange={() => setChoice("a4")}
        />{" "}
        A4 <small>210 × 297 mm</small>
      </label>
      <div>
        <button type="button" className="secondary" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="primary"
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
      <section className="doom-hero">
        <div className="doom-copy">
          <p className="eyebrow">Level-zero company</p>
          <h1>The Doomed</h1>
          <p>
            <b>{state.characters.length}</b>{" "}
            {state.characters.length === 1 ? "character" : "characters"}
          </p>
          <span className="doom-rule">◇—☠—◇</span>
        </div>
      </section>
      <section className="funnel-actions">
        <button className="primary roll" onClick={roll}>
          <img src={asset("dice.webp")} alt="" />
          <span>
            Roll {rollCount === 1 ? "One Wretch" : `${rollCount} Wretches`}
          </span>
        </button>
        <button
          className="secondary funnel"
          disabled={!state.characters.length}
          onClick={() => (selecting ? endSelection() : setSelecting(true))}
        >
          <img src={asset("printer.webp")} alt="" />
          <span>
            {selecting ? "Cancel the Casting" : "Cast Them Into the Funnel"}
          </span>
        </button>
      </section>
      <section className="fates">
        <div className="section-title">
          <i />
          <h2>Recorded Fates</h2>
          <i />
        </div>
        <nav className="fate-filters" aria-label="Filter recorded fates">
          {(["all", "living", "fallen"] as Filter[]).map((value) => (
            <button
              key={value}
              className={filter === value ? "active" : ""}
              onClick={() => setFilter(value)}
            >
              {value === "fallen"
                ? "☠ Fallen"
                : `◇ ${value === "all" ? "All" : "Living"}`}
            </button>
          ))}
        </nav>
        {selecting && (
          <div className="selection-bar">
            <strong>{selected.size} marked</strong>
            <button
              className="text-button"
              onClick={() =>
                setSelected(new Set(state.characters.map((c) => c.id)))
              }
            >
              Mark all
            </button>
            <button
              className="primary"
              disabled={!selected.size}
              onClick={() => setPrinting(true)}
            >
              Prepare the Funnel
            </button>
          </div>
        )}
        <div className="cards">
          {visible.map((c) => (
            <CharacterCard
              key={c.id}
              character={c}
              selecting={selecting || deleting}
              selected={selected.has(c.id)}
              onToggle={() => toggle(c.id)}
              onOpen={() => {
                location.hash = `#/characters/${c.id}`;
              }}
            />
          ))}
        </div>
        {!state.characters.length ? (
          <section className="empty">
            <span className="empty-die">◇</span>
            <h2>No fates recorded</h2>
            <p>Roll four wretches and see who survives the first breath.</p>
          </section>
        ) : (
          !visible.length && (
            <section className="empty">
              <h2>
                No {filter === "living" ? "living souls" : "fallen souls"}
              </h2>
            </section>
          )
        )}
        {state.characters.length > 0 && !selecting && (
          <div className="deletion-actions">
            <button
              className="danger delete-action"
              disabled={deleting && selected.size === 0}
              onClick={() => (deleting ? confirmDeletion() : setDeleting(true))}
            >
              <span className="trash-icon" aria-hidden="true" />
              <span>
                {deleting
                  ? `Confirm delete ${selected.size}`
                  : "Mass elimination"}
              </span>
            </button>
            {deleting && (
              <button className="secondary" onClick={endDeletion}>
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
