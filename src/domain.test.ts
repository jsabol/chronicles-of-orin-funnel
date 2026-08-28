import { describe, expect, it } from "vitest";
import {
  ANCESTRIES,
  CANTRIPS,
  OCCUPATIONS,
  SRD_CANTRIP_BY_NAME,
  TRINKETS,
} from "./data";
import {
  abilityModifier,
  createCharacter,
  createFunnelBatch,
  deriveCharacter,
  finalAbilityScores,
  rollAbility,
  type RandomSource,
  validateCharacter,
} from "./domain";

const fixed = (values: number[]): RandomSource => {
  let i = 0;
  return { int: (max) => values[i++ % values.length]! % max };
};

describe("funnel rules", () => {
  it("rolls 4d6 and drops the lowest", () =>
    expect(rollAbility(fixed([0, 1, 2, 5]))).toBe(11));
  it("floors negative modifiers", () => expect(abilityModifier(9)).toBe(-1));
  it("contains exactly the permitted ancestries and d20 tables", () => {
    expect(ANCESTRIES).toHaveLength(13);
    expect(ANCESTRIES.map((a) => a.id)).not.toContain("goliath");
    expect(OCCUPATIONS).toHaveLength(20);
    expect(TRINKETS).toHaveLength(20);
    expect(
      ANCESTRIES.filter((ancestry) => ancestry.category === "common"),
    ).toHaveLength(5);
    expect(
      ANCESTRIES.filter((ancestry) => ancestry.category === "uncommon"),
    ).toHaveLength(3);
    expect(
      ANCESTRIES.filter((ancestry) => ancestry.category === "exotic"),
    ).toHaveLength(5);
  });
  it("rolls ancestries using the requested category weights", () => {
    expect(createCharacter("batch", fixed([64, 4])).ancestryId).toBe("sun-elf");
    expect(createCharacter("batch", fixed([65, 2])).ancestryId).toBe(
      "wode-elf",
    );
    expect(createCharacter("batch", fixed([95, 4])).ancestryId).toBe("yuan-ti");
  });
  it("uses the SRD 5.2 cantrip catalog", () => {
    expect(CANTRIPS).toHaveLength(28);
    expect(CANTRIPS).toEqual(
      expect.arrayContaining([
        "Elementalism",
        "Sorcerous Burst",
        "Starry Wisp",
        "Thorn Whip",
      ]),
    );
    expect(CANTRIPS).not.toEqual(
      expect.arrayContaining(["Blade Ward", "Friends"]),
    );
    expect(SRD_CANTRIP_BY_NAME.get("Chill Touch")?.range).toBe("Touch");
    expect(SRD_CANTRIP_BY_NAME.get("Thorn Whip")?.range).toBe("30 feet");
  });
  it("applies ancestry increases and derives HP and AC", () => {
    const c = createCharacter(
      "batch",
      fixed([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ]),
    );
    c.ancestryId = "beastkin";
    c.ancestryChoices = { adaptation: "tough-hide" };
    c.rawAbilities = { str: 9, dex: 12, con: 9, int: 10, wis: 10, cha: 10 };
    c.hpRoll = 1;
    expect(finalAbilityScores(c).dex).toBe(14);
    const d = deriveCharacter(c);
    expect(d.armorClass).toBe(11);
    expect(d.maxHp).toBe(0);
    expect(d.status).toBe("living");
    expect(d.gear).toContain(
      "Improvised Weapon [hit -1 | dmg 1d4-1 | thrown 20/60]",
    );
    c.hpRoll = 0;
    expect(deriveCharacter(c).status).toBe("fallen");
  });
  it("treats a Stone Cutter's mason's hammer as a Light Hammer", () => {
    const c = createCharacter("batch");
    c.ancestryId = "human";
    c.ancestryChoices = {};
    c.occupationId = 2;
    c.rawAbilities = { str: 14, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
    expect(deriveCharacter(c).gear).toContain(
      "Mason's hammer (Light Hammer) [hit +2 | dmg 1d4+2 Bludgeoning | light, thrown 20/60, nick]",
    );
  });
  it("gives a Slave Cook's healing salve Potion of Healing rules", () => {
    const c = createCharacter("batch");
    c.occupationId = 9;
    expect(deriveCharacter(c).gear).toContain(
      "1 healing salve (Potion of Healing). As a Bonus Action, drink it or administer it to another creature within 5 feet; the creature regains 2d4 + 2 Hit Points.",
    );
  });
  it("retains deaths while rolling until four living characters exist", () => {
    const batch = createFunnelBatch(
      fixed([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5,
      ]),
    );
    expect(
      batch.filter((c) => deriveCharacter(c).status === "living"),
    ).toHaveLength(4);
  });
  it("allows an explicit fate and cause of death", () => {
    const c = createCharacter("batch");
    c.fateOverride = "fallen";
    c.causeOfDeath = "Taken by the red storm";
    expect(deriveCharacter(c).status).toBe("fallen");
    c.fateOverride = "living";
    expect(deriveCharacter(c).status).toBe("living");
  });
  it("validates ancestry point budgets", () => {
    const c = createCharacter("batch");
    c.ancestryId = "tiefling";
    c.ancestryChoices = { traits: [] };
    expect(validateCharacter(c).join(" ")).toMatch(/exactly 3/);
  });
});
