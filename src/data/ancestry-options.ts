import type { TraitDefinition } from "../types";

export const trait = (
  id: string,
  name: string,
  summary: string,
  points?: number,
): TraitDefinition => ({ id, name, summary, points });

export const BEASTKIN_ADAPTATIONS = [
  trait("claws", "Claws", "Your unarmed strikes can deal 1d6 slashing damage."),
  trait(
    "keen-scent",
    "Keen Scent",
    "Advantage on Perception and Survival checks that rely on smell.",
  ),
  trait(
    "fleet-stride",
    "Fleet Stride",
    "Your walking speed increases by 5 ft.",
  ),
  trait("tough-hide", "Tough Hide", "You gain +1 AC while you are unarmored."),
] as const;

export const SHIFTER_FORMS = [
  trait(
    "beasthide",
    "Beasthide",
    "While shifted, gain 1d6 extra temporary HP and +1 AC.",
  ),
  trait(
    "longtooth",
    "Longtooth",
    "While shifted, make a 1d6 + Strength piercing bite as a bonus action.",
  ),
  trait(
    "swiftstride",
    "Swiftstride",
    "While shifted, speed increases 10 ft.; reaction-move 10 ft. without opportunity attacks.",
  ),
  trait(
    "wildhunt",
    "Wildhunt",
    "While shifted, gain advantage on Wisdom checks and nearby foes cannot attack you with advantage.",
  ),
] as const;

export const WARFORGED_SCARS = [
  trait(
    "legs",
    "Scar: Legs",
    "Speed is 20 ft.; after standing still for 1 minute, gain advantage on Perception until you move.",
  ),
  trait(
    "arms",
    "Scar: Arms",
    "One arm is unusable; unarmed strikes deal 1d4 and melee or thrown weapon attacks deal +1 damage.",
  ),
  trait(
    "eyes",
    "Scar: Eyes",
    "Vision is limited to 10 ft., but you have tremorsense to 60 ft.",
  ),
  trait(
    "language",
    "Scar: Language",
    "Cannot form new phrases; can read lips within 60 ft. and understand one additional language.",
  ),
  trait(
    "truth",
    "Scar: Truth",
    "Cannot lie; gain advantage on Insight checks to detect lies.",
  ),
  trait(
    "behaviour",
    "Scar: Behaviour",
    "Disadvantage on Charisma checks against non-constructs; advantage on saves against charm and fear.",
  ),
] as const;

export const DRAGON_TRAITS = [
  trait(
    "guard",
    "Draconian Guard",
    "Reaction: reduce damage to you or an adjacent creature by your proficiency bonus.",
    1,
  ),
  trait(
    "prismatic",
    "Prismatic Scales",
    "Choose a second lineage; gain its damage resistance and breath damage choice.",
    1,
  ),
  trait(
    "oath",
    "Remember Your Oath",
    "Bonus action: gain advantage on saving throws until your next turn.",
    1,
  ),
  trait(
    "breath",
    "Dragon Breath",
    "Once per short or long rest, replace an attack with a 15-ft. cone or 30-ft. line for 1d10 lineage damage; Dex save for half.",
    2,
  ),
  trait(
    "roar",
    "Dragon Roar",
    "Once per short or long rest, replace an attack with a roar; nearby enemies make a Wisdom save or become frightened.",
    2,
  ),
] as const;

export const TIEFLING_TRAITS = [
  trait(
    "barbed-tail",
    "Barbed Tail",
    "Once per round, a melee attack deals bonus damage equal to proficiency bonus.",
    1,
  ),
  trait(
    "beast-legs",
    "Beast Legs",
    "Your walking speed increases by 10 ft.",
    1,
  ),
  trait(
    "glowing-eyes",
    "Glowing Eyes",
    "Reaction when damaged: the attacker takes psychic damage equal to proficiency bonus.",
    1,
  ),
  trait(
    "hellsight",
    "Hellsight",
    "See through nonmagical darkness, fog, and concealment as though dimly lit.",
    1,
  ),
  trait(
    "horns",
    "Impressive Horns",
    "Advantage on saving throws against charm and fear.",
    2,
  ),
  trait("prehensile-tail", "Prehensile Tail", "You cannot be flanked.", 2),
  trait(
    "wings",
    "Wings",
    "Fly speed 30 ft. for Strength modifier rounds (minimum 1); at levels 1-3, vulnerable to all damage while flying.",
    2,
  ),
] as const;

export const FOCUSES = [
  "Forge a flawless weapon",
  "Restore a clan relic",
  "Map a buried city",
  "Raise a child safely",
  "Repay an ancestral debt",
  "Complete a great mural",
  "Master a lost craft",
  "Avenge a fallen kinsmate",
] as const;

export const RUNE_TARGETS = [
  "Humans",
  "Undead",
  "Constructs",
  "Dragons",
  "Fiends",
  "Weapons",
  "Potions",
  "Relics",
  "Fresh water",
  "Arcane objects",
] as const;
