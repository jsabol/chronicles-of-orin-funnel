import {
  ABILITIES,
  type Ability,
  type AbilityScores,
  type AncestryChoices,
  type CharacterRecordV1,
  type DerivedCharacter,
  type OccupationChoices,
  type TraitDefinition,
} from "./types";
import {
  ANCESTRIES,
  ANCESTRY_BY_ID,
  BEASTKIN_ADAPTATIONS,
  CANTRIPS,
  formatSrdCantrip,
  COMMON_LANGUAGES,
  DRAGON_LINEAGES,
  DRAGON_TRAITS,
  EXOTIC_LANGUAGES,
  FOCUSES,
  OCCUPATIONS,
  OCCUPATION_BY_ID,
  POWERS,
  POWER_BY_ID,
  RUNE_TARGETS,
  SHIFTER_FORMS,
  SKILLS,
  TIEFLING_TRAITS,
  TOOLS,
  TRINKETS,
  TRINKET_BY_ID,
  UNCOMMON_LANGUAGES,
  WARFORGED_SCARS,
  WEAPONS,
  WIZARD_CANTRIPS,
} from "./data";

export interface RandomSource {
  int(maxExclusive: number): number;
}

export const cryptoRandom: RandomSource = {
  int(maxExclusive: number): number {
    if (!Number.isInteger(maxExclusive) || maxExclusive <= 0)
      throw new Error("Random bound must be a positive integer");
    const limit = Math.floor(0x1_0000_0000 / maxExclusive) * maxExclusive;
    const values = new Uint32Array(1);
    do crypto.getRandomValues(values);
    while (values[0] >= limit);
    return values[0] % maxExclusive;
  },
};

export const pick = <T>(items: readonly T[], random: RandomSource): T => {
  if (items.length === 0) throw new Error("Cannot pick from an empty catalog");
  return items[random.int(items.length)];
};

const uniquePicks = <T>(
  items: readonly T[],
  count: number,
  random: RandomSource,
): T[] => {
  const pool = [...items];
  const result: T[] = [];
  while (result.length < count && pool.length > 0) {
    result.push(pool.splice(random.int(pool.length), 1)[0]);
  }
  return result;
};

const weaponGear = (
  entry: string,
  modifiers: AbilityScores,
  proficiencies: string[],
): string => {
  const daggerMatch = entry.match(/^(\d+ )?(?:obsidian )?daggers?$/i);
  if (!daggerMatch) return entry;
  const ability = Math.max(modifiers.str, modifiers.dex);
  const proficient =
    proficiencies.includes("Dagger") ||
    proficiencies.includes("Simple weapons") ||
    proficiencies.includes("Martial weapons");
  const hit = ability + (proficient ? 2 : 0);
  return `${entry} [hit ${hit >= 0 ? "+" : ""}${hit} | dmg 1d4${ability >= 0 ? "+" : ""}${ability}]`;
};
export const rollAbility = (random: RandomSource = cryptoRandom): number => {
  const dice = Array.from({ length: 4 }, () => random.int(6) + 1).sort(
    (a, b) => a - b,
  );
  return dice[1] + dice[2] + dice[3];
};

export const rollAbilities = (
  random: RandomSource = cryptoRandom,
): AbilityScores =>
  Object.fromEntries(
    ABILITIES.map((ability) => [ability, rollAbility(random)]),
  ) as AbilityScores;

export const abilityModifier = (score: number): number =>
  Math.floor((score - 10) / 2);

export const formatModifier = (modifier: number): string =>
  modifier >= 0 ? "+" + modifier : String(modifier);

export const validPointCombinations = (
  traits: readonly TraitDefinition[],
): string[][] => {
  const combinations: string[][] = [];
  for (let mask = 1; mask < 2 ** traits.length; mask += 1) {
    const selected = traits.filter((_, index) => Boolean(mask & (1 << index)));
    if (selected.reduce((sum, item) => sum + (item.points ?? 0), 0) === 3) {
      combinations.push(selected.map((item) => item.id));
    }
  }
  return combinations;
};

const randomPointCombination = (
  traits: readonly TraitDefinition[],
  random: RandomSource,
): string[] => pick(validPointCombinations(traits), random);

const allFlexibleLanguages = [
  ...COMMON_LANGUAGES,
  ...UNCOMMON_LANGUAGES,
] as const;

export const generateAncestryChoices = (
  ancestryId: string,
  random: RandomSource = cryptoRandom,
): AncestryChoices => {
  switch (ancestryId) {
    case "deep-dwarf":
      return {
        tool: pick(TOOLS, random),
        focus: pick(FOCUSES, random),
        runeTarget: pick(RUNE_TARGETS, random),
      };
    case "human":
      return {
        tool: pick(TOOLS, random),
        languages:
          random.int(2) === 0
            ? uniquePicks(allFlexibleLanguages, 2, random)
            : [pick(EXOTIC_LANGUAGES, random)],
      };
    case "sand-dwarf":
      return { abilityBoost: pick(["dex", "wis"] as const, random) };
    case "smallfolk":
      return { languages: [pick(allFlexibleLanguages, random)] };
    case "sun-elf":
      return {
        weapon: pick(WEAPONS, random),
        cantrip: pick(WIZARD_CANTRIPS, random),
        spellcastingAbility: pick(["int", "wis", "cha"] as const, random),
      };
    case "beastkin":
      return { adaptation: pick(BEASTKIN_ADAPTATIONS, random).id };
    case "dragonkin": {
      const dragonLineage = pick(DRAGON_LINEAGES, random).name;
      const traits = randomPointCombination(DRAGON_TRAITS, random);
      const secondaryDragonLineage = traits.includes("prismatic")
        ? pick(
            DRAGON_LINEAGES.filter((lineage) => lineage.name !== dragonLineage),
            random,
          ).name
        : undefined;
      return { dragonLineage, secondaryDragonLineage, traits };
    }
    case "shifter":
      return {
        abilityBoost: pick(["str", "dex"] as const, random),
        shift: pick(SHIFTER_FORMS, random).id,
      };
    case "warforged": {
      const scar =
        random.int(WARFORGED_SCARS.length + 1) === 0
          ? undefined
          : pick(WARFORGED_SCARS, random).id;
      const languageCount = scar === "language" ? 2 : 1;
      return {
        abilityBoost: pick(
          ["str", "dex", "int", "wis", "cha"] as const,
          random,
        ),
        languages: uniquePicks(allFlexibleLanguages, languageCount, random),
        skill: pick(SKILLS, random),
        tool: pick(TOOLS, random),
        scar,
      };
    }
    case "tiefling":
      return { traits: randomPointCombination(TIEFLING_TRAITS, random) };
    default:
      return {};
  }
};

export const generateOccupationChoices = (
  occupationId: number,
  random: RandomSource = cryptoRandom,
): OccupationChoices => {
  const occupation = OCCUPATION_BY_ID.get(occupationId);
  if (occupation?.special === "cantrip")
    return { cantrip: pick(CANTRIPS, random) };
  if (occupation?.special === "power")
    return { power: pick(POWERS, random).id };
  return {};
};

export const generateName = (
  ancestryId: string,
  random: RandomSource = cryptoRandom,
): string => {
  const profile = ANCESTRY_BY_ID.get(ancestryId)?.nameProfile;
  if (!profile || profile.given.length === 0) {
    const first = pick(
      ["Ash", "Vex", "Silt", "Rook", "Kara", "Morrow"],
      random,
    );
    const second = pick(
      ["Dustwalker", "Redscar", "Ironwind", "Drywell"],
      random,
    );
    return random.int(2) === 0 ? first : first + " " + second;
  }
  const given = pick(profile.given, random);
  if (profile.style === "family" && profile.second?.length)
    return given + " " + pick(profile.second, random);
  if (
    profile.style === "title" &&
    profile.second?.length &&
    random.int(2) === 0
  )
    return given + " " + pick(profile.second, random);
  return given;
};

const addBonus = (
  scores: AbilityScores,
  ability: Ability,
  amount: number,
): void => {
  scores[ability] += amount;
};

export const finalAbilityScores = (
  record: CharacterRecordV1,
): AbilityScores => {
  const ancestry = ANCESTRY_BY_ID.get(record.ancestryId);
  const scores = { ...record.rawAbilities };
  if (!ancestry) return scores;
  for (const ability of ABILITIES)
    addBonus(scores, ability, ancestry.fixedBonuses[ability] ?? 0);
  if (
    record.ancestryId === "sand-dwarf" &&
    record.ancestryChoices.abilityBoost
  ) {
    addBonus(scores, record.ancestryChoices.abilityBoost, 2);
  }
  if (record.ancestryId === "shifter" && record.ancestryChoices.abilityBoost) {
    addBonus(scores, record.ancestryChoices.abilityBoost, 1);
  }
  if (
    record.ancestryId === "warforged" &&
    record.ancestryChoices.abilityBoost
  ) {
    addBonus(scores, record.ancestryChoices.abilityBoost, 1);
  }
  return scores;
};

const selectedTraits = (
  ids: string[] | undefined,
  catalog: readonly TraitDefinition[],
): TraitDefinition[] =>
  (ids ?? [])
    .map((id) => catalog.find((item) => item.id === id))
    .filter((item): item is TraitDefinition => Boolean(item));

const lineageTrait = (record: CharacterRecordV1): TraitDefinition[] => {
  const primary = DRAGON_LINEAGES.find(
    (item) => item.name === record.ancestryChoices.dragonLineage,
  );
  if (!primary) return [];
  const result = [
    {
      id: "lineage",
      name: "Draconic Ancestry",
      summary:
        primary.name +
        " lineage; resistance to " +
        primary.damage.toLowerCase() +
        " damage.",
    },
  ];
  const secondary = DRAGON_LINEAGES.find(
    (item) => item.name === record.ancestryChoices.secondaryDragonLineage,
  );
  if (secondary && record.ancestryChoices.traits?.includes("prismatic")) {
    result.push({
      id: "secondary-lineage",
      name: "Prismatic Lineage",
      summary:
        secondary.name +
        " lineage; also resist " +
        secondary.damage.toLowerCase() +
        " damage.",
    });
  }
  return result;
};

export const deriveCharacter = (
  record: CharacterRecordV1,
): DerivedCharacter => {
  const ancestry = ANCESTRY_BY_ID.get(record.ancestryId) ?? ANCESTRIES[0];
  const occupation =
    OCCUPATION_BY_ID.get(record.occupationId) ?? OCCUPATIONS[0];
  const trinket = TRINKET_BY_ID.get(record.trinketId) ?? TRINKETS[0];
  const finalAbilities = finalAbilityScores(record);
  const modifiers = Object.fromEntries(
    ABILITIES.map((ability) => [
      ability,
      abilityModifier(finalAbilities[ability]),
    ]),
  ) as AbilityScores;

  let armorClass = 8 + modifiers.dex;
  let speed = ancestry.speed;
  const proficiencies: string[] = [];
  const languages = [...ancestry.languages];
  const traits = [...ancestry.traits];
  const magic: string[] = [];
  const gear = occupation.gear !== "Nothing" ? [occupation.gear] : [];

  if (!occupation.special && occupation.proficiency !== "Nothing")
    proficiencies.push(occupation.proficiency);
  if (occupation.special === "mending")
    magic.push(formatSrdCantrip("Mending") + " Once per day.");
  if (occupation.special === "cantrip" && record.occupationChoices.cantrip) {
    magic.push(formatSrdCantrip(record.occupationChoices.cantrip));
  }
  if (occupation.special === "power" && record.occupationChoices.power) {
    const power = POWER_BY_ID.get(record.occupationChoices.power);
    if (power) magic.push(power.name + " - " + power.summary);
  }

  switch (record.ancestryId) {
    case "deep-dwarf":
      if (record.ancestryChoices.tool)
        proficiencies.push(record.ancestryChoices.tool);
      break;
    case "human":
      if (record.ancestryChoices.tool)
        proficiencies.push(record.ancestryChoices.tool);
      languages.push(...(record.ancestryChoices.languages ?? []));
      break;
    case "sand-dwarf":
      proficiencies.push("Perception");
      break;
    case "smallfolk":
      languages.push(...(record.ancestryChoices.languages ?? []));
      break;
    case "sun-elf":
      proficiencies.push("Perception");
      if (record.ancestryChoices.weapon)
        proficiencies.push(record.ancestryChoices.weapon);
      if (record.ancestryChoices.cantrip) {
        magic.push(formatSrdCantrip(record.ancestryChoices.cantrip));
      }
      break;
    case "beastkin": {
      proficiencies.push("Survival");
      const adaptation = BEASTKIN_ADAPTATIONS.find(
        (item) => item.id === record.ancestryChoices.adaptation,
      );
      if (adaptation) {
        traits.push(adaptation);
        if (adaptation.id === "fleet-stride") speed += 5;
        if (adaptation.id === "tough-hide") armorClass += 1;
      }
      break;
    }
    case "dragonkin":
      traits.push(
        ...lineageTrait(record),
        ...selectedTraits(record.ancestryChoices.traits, DRAGON_TRAITS),
      );
      break;
    case "shifter": {
      const form = SHIFTER_FORMS.find(
        (item) => item.id === record.ancestryChoices.shift,
      );
      if (form) traits.push(form);
      break;
    }
    case "warforged": {
      armorClass += 1;
      languages.push(...(record.ancestryChoices.languages ?? []));
      if (record.ancestryChoices.skill)
        proficiencies.push(record.ancestryChoices.skill);
      if (record.ancestryChoices.tool)
        proficiencies.push(record.ancestryChoices.tool);
      const scar = WARFORGED_SCARS.find(
        (item) => item.id === record.ancestryChoices.scar,
      );
      if (scar) {
        traits.push(scar);
        if (scar.id === "legs") speed = 20;
      }
      break;
    }
    case "orken":
      proficiencies.push("Intimidation");
      break;
    case "tiefling": {
      const infernal = selectedTraits(
        record.ancestryChoices.traits,
        TIEFLING_TRAITS,
      );
      traits.push(...infernal);
      if (infernal.some((item) => item.id === "beast-legs")) speed += 10;
      break;
    }
    case "wode-elf":
      proficiencies.push("Perception");
      magic.push(formatSrdCantrip("Thorn Whip"));
      break;
  }

  const maxHp = record.hpRoll + modifiers.con;
  return {
    record,
    ancestry,
    occupation,
    trinket,
    finalAbilities,
    modifiers,
    proficiencyBonus: 2,
    armorClass,
    maxHp,
    status: record.fateOverride ?? (maxHp < 0 ? "deceased" : "living"),
    hitDice: record.ancestryId === "human" ? "3d4" : "1d4",
    speed,
    size: ancestry.size,
    languages: [...new Set(languages)],
    proficiencies: [...new Set(proficiencies)],
    gear: gear.map((item) => weaponGear(item, modifiers, proficiencies)),
    traits,
    magic,
  };
};

export const createCharacter = (
  batchId: string,
  random: RandomSource = cryptoRandom,
  now = new Date(),
): CharacterRecordV1 => {
  const ancestry = pick(ANCESTRIES, random);
  const occupation = pick(OCCUPATIONS, random);
  const timestamp = now.toISOString();
  return {
    schemaVersion: 1,
    id: crypto.randomUUID(),
    batchId,
    createdAt: timestamp,
    updatedAt: timestamp,
    name: generateName(ancestry.id, random),
    rawAbilities: rollAbilities(random),
    hpRoll: random.int(4) + 1,
    ancestryId: ancestry.id,
    ancestryChoices: generateAncestryChoices(ancestry.id, random),
    occupationId: occupation.id,
    occupationChoices: generateOccupationChoices(occupation.id, random),
    trinketId: pick(TRINKETS, random).id,
    trinketAnswer: "",
  };
};

export const createFunnelBatch = (
  random: RandomSource = cryptoRandom,
  targetLiving = 4,
): CharacterRecordV1[] => {
  const batchId = crypto.randomUUID();
  const result: CharacterRecordV1[] = [];
  let living = 0;
  let attempts = 0;
  while (living < targetLiving && attempts < 1000) {
    const character = createCharacter(
      batchId,
      random,
      new Date(Date.now() + attempts),
    );
    result.push(character);
    if (deriveCharacter(character).status === "living") living += 1;
    attempts += 1;
  }
  if (living < targetLiving)
    throw new Error(
      "Unable to roll a complete living funnel after 1,000 attempts",
    );
  return result;
};

export const validateCharacter = (record: CharacterRecordV1): string[] => {
  const errors: string[] = [];
  if (!record.name.trim()) errors.push("Name is required.");
  if (record.name.length > 60)
    errors.push("Name must be 60 characters or fewer.");
  if ((record.causeOfDeath?.length ?? 0) > 120)
    errors.push("Cause of death must be 120 characters or fewer.");
  for (const ability of ABILITIES) {
    const value = record.rawAbilities[ability];
    if (!Number.isInteger(value) || value < 3 || value > 18)
      errors.push(ability.toUpperCase() + " must be between 3 and 18.");
  }
  if (
    !Number.isInteger(record.hpRoll) ||
    record.hpRoll < 1 ||
    record.hpRoll > 4
  )
    errors.push("HP roll must be between 1 and 4.");
  if (!ANCESTRY_BY_ID.has(record.ancestryId))
    errors.push("Choose a valid ancestry.");
  if (!OCCUPATION_BY_ID.has(record.occupationId))
    errors.push("Choose a valid occupation.");
  if (!TRINKET_BY_ID.has(record.trinketId))
    errors.push("Choose a valid trinket.");

  if (record.ancestryId === "dragonkin" || record.ancestryId === "tiefling") {
    const catalog =
      record.ancestryId === "dragonkin" ? DRAGON_TRAITS : TIEFLING_TRAITS;
    const selected = selectedTraits(record.ancestryChoices.traits, catalog);
    if (selected.reduce((sum, item) => sum + (item.points ?? 0), 0) !== 3)
      errors.push("Ancestry traits must total exactly 3 points.");
  }
  if (
    record.ancestryChoices.traits?.includes("prismatic") &&
    record.ancestryChoices.dragonLineage ===
      record.ancestryChoices.secondaryDragonLineage
  ) {
    errors.push("Primary and secondary Dragonkin lineages must be different.");
  }
  if (record.ancestryId === "human") {
    const chosen = record.ancestryChoices.languages ?? [];
    const valid =
      (chosen.length === 1 &&
        EXOTIC_LANGUAGES.includes(
          chosen[0] as (typeof EXOTIC_LANGUAGES)[number],
        )) ||
      (chosen.length === 2 &&
        chosen.every((language) =>
          allFlexibleLanguages.includes(
            language as (typeof allFlexibleLanguages)[number],
          ),
        ) &&
        new Set(chosen).size === 2);
    if (!valid)
      errors.push(
        "Humans choose two common/uncommon languages or one exotic language.",
      );
  }
  return errors;
};
