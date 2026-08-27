import { describe, expect, it } from "vitest";
import { createCharacter } from "./domain";
import { createCharacterStore, STORAGE_KEY, type StorageLike } from "./storage";

class MemoryStorage implements StorageLike {
  data = new Map<string, string>();
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.data.set(k, v);
  }
}
describe("character storage", () => {
  it("round trips edits, deletion, and paper size", () => {
    const memory = new MemoryStorage(),
      store = createCharacterStore(memory),
      c = createCharacter("one");
    store.addCharacters([c]);
    c.name = "Changed";
    store.updateCharacter(c);
    store.setPaperSize("a4");
    const restored = createCharacterStore(memory);
    expect(restored.getState().characters[0]?.name).toBe("Changed");
    expect(restored.getState().paperSize).toBe("a4");
    restored.deleteCharacter(c.id);
    expect(restored.getState().characters).toHaveLength(0);
  });
  it("falls back defensively for malformed data", () => {
    const memory = new MemoryStorage();
    memory.setItem(STORAGE_KEY, "not-json");
    const store = createCharacterStore(memory);
    expect(store.warning).toBeTruthy();
    expect(store.getState().characters).toEqual([]);
  });
});
