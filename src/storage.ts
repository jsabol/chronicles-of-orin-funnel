import type { CharacterRecordV1, PaperSize, StoredDataV1 } from "./types";

export const STORAGE_KEY = "chronicles-of-orrin-funnel.characters.v1";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface CharacterStore {
  readonly warning: string | null;
  getState(): StoredDataV1;
  addCharacters(characters: CharacterRecordV1[]): void;
  updateCharacter(character: CharacterRecordV1): void;
  deleteCharacter(id: string): void;
  deleteCharacters(ids: readonly string[]): void;
  setPaperSize(paperSize: PaperSize): void;
}

const emptyState = (): StoredDataV1 => ({
  version: 1,
  characters: [],
  paperSize: "letter",
});

const isRecord = (value: unknown): value is CharacterRecordV1 => {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<CharacterRecordV1>;
  return (
    record.schemaVersion === 1 &&
    typeof record.id === "string" &&
    typeof record.batchId === "string" &&
    typeof record.name === "string" &&
    typeof record.ancestryId === "string" &&
    typeof record.occupationId === "number" &&
    typeof record.trinketId === "number" &&
    typeof record.hpRoll === "number" &&
    Boolean(record.rawAbilities) &&
    Boolean(record.ancestryChoices) &&
    Boolean(record.occupationChoices)
  );
};

const migrateLegacyStatus = (record: CharacterRecordV1): CharacterRecordV1 =>
  (record.fateOverride as unknown) === "deceased"
    ? { ...record, fateOverride: "fallen" }
    : record;

const srd52CantripReplacements: Readonly<Record<string, string>> = {
  "Blade Ward": "True Strike",
  Friends: "Message",
};

const migrateSrdCantrips = (record: CharacterRecordV1): CharacterRecordV1 => {
  const ancestryCantrip = record.ancestryChoices.cantrip;
  const occupationCantrip = record.occupationChoices.cantrip;
  const nextAncestryCantrip = ancestryCantrip
    ? (srd52CantripReplacements[ancestryCantrip] ?? ancestryCantrip)
    : ancestryCantrip;
  const nextOccupationCantrip = occupationCantrip
    ? (srd52CantripReplacements[occupationCantrip] ?? occupationCantrip)
    : occupationCantrip;
  if (
    nextAncestryCantrip === ancestryCantrip &&
    nextOccupationCantrip === occupationCantrip
  )
    return record;
  return {
    ...record,
    ancestryChoices: {
      ...record.ancestryChoices,
      cantrip: nextAncestryCantrip,
    },
    occupationChoices: {
      ...record.occupationChoices,
      cantrip: nextOccupationCantrip,
    },
  };
};

const parseState = (raw: string | null): StoredDataV1 => {
  if (!raw) return emptyState();
  const parsed = JSON.parse(raw) as Partial<StoredDataV1>;
  if (parsed.version !== 1 || !Array.isArray(parsed.characters))
    throw new Error("Unsupported storage schema");
  return {
    version: 1,
    characters: parsed.characters
      .filter(isRecord)
      .map(migrateLegacyStatus)
      .map(migrateSrdCantrips),
    paperSize: parsed.paperSize === "a4" ? "a4" : "letter",
  };
};

export const createCharacterStore = (storage?: StorageLike): CharacterStore => {
  let warning: string | null = null;
  let state = emptyState();
  const target =
    storage ??
    (() => {
      try {
        return window.localStorage;
      } catch {
        return undefined;
      }
    })();

  try {
    if (!target) throw new Error("Browser storage is unavailable");
    state = parseState(target.getItem(STORAGE_KEY));
  } catch {
    warning =
      "Saved characters could not be loaded. This session will continue without persistent storage.";
    state = emptyState();
  }

  const persist = (): void => {
    if (!target) return;
    try {
      target.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      warning =
        "Changes are available for this session, but browser storage is unavailable.";
    }
  };

  return {
    get warning() {
      return warning;
    },
    getState: () => structuredClone(state),
    addCharacters(characters) {
      state = {
        ...state,
        characters: [...state.characters, ...structuredClone(characters)],
      };
      persist();
    },
    updateCharacter(character) {
      state = {
        ...state,
        characters: state.characters.map((item) =>
          item.id === character.id ? structuredClone(character) : item,
        ),
      };
      persist();
    },
    deleteCharacter(id) {
      state = {
        ...state,
        characters: state.characters.filter((item) => item.id !== id),
      };
      persist();
    },
    deleteCharacters(ids) {
      const idsToDelete = new Set(ids);
      state = {
        ...state,
        characters: state.characters.filter(
          (item) => !idsToDelete.has(item.id),
        ),
      };
      persist();
    },
    setPaperSize(paperSize) {
      state = { ...state, paperSize };
      persist();
    },
  };
};
