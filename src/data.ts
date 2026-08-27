import type {
  AncestryDefinition,
  DragonLineage,
  OccupationDefinition,
  PowerDefinition,
  TraitDefinition,
  TrinketDefinition,
} from "./types";

export const COMMON_LANGUAGES = ["Fairspeak", "Undercommon", "Dukhet"] as const;
export const UNCOMMON_LANGUAGES = [
  "Thieves' Cant",
  "Druidic",
  "Thoughtsign",
] as const;
export const EXOTIC_LANGUAGES = ["Primeld", "Abyssal"] as const;

export const TOOLS = [
  "Bonecarver's tools",
  "Leatherworker's tools",
  "Mason's tools",
  "Potter's tools",
  "Smith's tools",
  "Tinkerer's tools",
  "Weaver's tools",
  "Herbalism kit",
  "Navigator's tools",
  "Scavenger's kit",
  "Land vehicles",
  "Water vehicles",
] as const;

export const SKILLS = [
  "Acrobatics",
  "Animal Handling",
  "Arcana",
  "Athletics",
  "Deception",
  "History",
  "Insight",
  "Intimidation",
  "Investigation",
  "Medicine",
  "Nature",
  "Perception",
  "Performance",
  "Persuasion",
  "Religion",
  "Sleight of Hand",
  "Stealth",
  "Survival",
] as const;

export const WEAPONS = [
  "Club",
  "Dagger",
  "Greatclub",
  "Handaxe",
  "Javelin",
  "Light hammer",
  "Mace",
  "Quarterstaff",
  "Sickle",
  "Spear",
  "Light crossbow",
  "Dart",
  "Shortbow",
  "Sling",
  "Battleaxe",
  "Flail",
  "Glaive",
  "Greataxe",
  "Greatsword",
  "Halberd",
  "Lance",
  "Longsword",
  "Maul",
  "Morningstar",
  "Pike",
  "Rapier",
  "Scimitar",
  "Shortsword",
  "Trident",
  "War pick",
  "Warhammer",
  "Whip",
  "Blowgun",
  "Hand crossbow",
  "Heavy crossbow",
  "Longbow",
  "Net",
] as const;

export const CANTRIPS = [
  "Acid Splash",
  "Blade Ward",
  "Chill Touch",
  "Dancing Lights",
  "Druidcraft",
  "Eldritch Blast",
  "Fire Bolt",
  "Friends",
  "Guidance",
  "Light",
  "Mage Hand",
  "Mending",
  "Message",
  "Minor Illusion",
  "Poison Spray",
  "Prestidigitation",
  "Produce Flame",
  "Ray of Frost",
  "Resistance",
  "Sacred Flame",
  "Shillelagh",
  "Shocking Grasp",
  "Spare the Dying",
  "Thaumaturgy",
  "Thorn Whip",
  "True Strike",
  "Vicious Mockery",
] as const;

export interface SrdCantrip {
  name: string;
  castingTime: string;
  range: string;
  duration: string;
  description: string;
}
export const SRD_CANTRIPS: readonly SrdCantrip[] = [
  {
    name: "Acid Splash",
    castingTime: "1 action",
    range: "60 feet",
    duration: "Instantaneous",
    description:
      "You hurl a bubble of acid. Choose one or two creatures you can see within range; if two, they must be within 5 feet of each other. A target must succeed on a Dexterity saving throw or take 1d6 acid damage. The damage increases by 1d6 at 5th, 11th, and 17th level.",
  },
  {
    name: "Blade Ward",
    castingTime: "1 action",
    range: "Self",
    duration: "1 round",
    description:
      "You extend your hand and trace a sigil of warding in the air. Until the end of your next turn, you have resistance against bludgeoning, piercing, and slashing damage dealt by weapon attacks.",
  },
  {
    name: "Chill Touch",
    castingTime: "1 action",
    range: "120 feet",
    duration: "1 round",
    description:
      "You create a ghostly skeletal hand in the space of a creature within range. Make a ranged spell attack. On a hit, the target takes 1d8 necrotic damage and cannot regain hit points until the start of your next turn. An undead target also has disadvantage on attack rolls against you until then. Damage increases by 1d8 at 5th, 11th, and 17th level.",
  },
  {
    name: "Dancing Lights",
    castingTime: "1 action",
    range: "120 feet",
    duration: "Concentration, up to 1 minute",
    description:
      "You create up to four torch-sized lights within range. They can appear as lanterns, torches, or glowing orbs, shed dim light for 10 feet, and move up to 60 feet when you use an action. A light must stay within 20 feet of another light made by this spell.",
  },
  {
    name: "Druidcraft",
    castingTime: "1 action",
    range: "30 feet",
    duration: "Instantaneous",
    description:
      "You create one minor magical effect: predict the weather for 24 hours, make a flower blossom, create a harmless sensory effect, light or snuff a candle or small campfire, or create an instantaneous harmless sensory effect.",
  },
  {
    name: "Eldritch Blast",
    castingTime: "1 action",
    range: "120 feet",
    duration: "Instantaneous",
    description:
      "A beam of crackling energy streaks toward a creature within range. Make a ranged spell attack. On a hit, the target takes 1d10 force damage. The spell creates more beams at 5th, 11th, and 17th level.",
  },
  {
    name: "Fire Bolt",
    castingTime: "1 action",
    range: "120 feet",
    duration: "Instantaneous",
    description:
      "You hurl a mote of fire at a creature or object within range. Make a ranged spell attack. On a hit, the target takes 1d10 fire damage. A flammable object hit ignites if it is not worn or carried. Damage increases by 1d10 at 5th, 11th, and 17th level.",
  },
  {
    name: "Guidance",
    castingTime: "1 action",
    range: "Touch",
    duration: "Concentration, up to 1 minute",
    description:
      "You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number rolled to one ability check of its choice.",
  },
  {
    name: "Light",
    castingTime: "1 action",
    range: "Touch",
    duration: "1 hour",
    description:
      "You touch one object no larger than 10 feet in any dimension. Until the spell ends, it sheds bright light in a 20-foot radius and dim light for an additional 20 feet. The light can be colored or covered. The spell ends if you cast it again or dismiss it.",
  },
  {
    name: "Mage Hand",
    castingTime: "1 action",
    range: "30 feet",
    duration: "1 minute",
    description:
      "A spectral floating hand appears at a point you choose within range. It can manipulate an object, open an unlocked door or container, stow or retrieve an item, or pour a vial. The hand cannot attack, activate magic items, or carry more than 10 pounds.",
  },
  {
    name: "Mending",
    castingTime: "1 minute",
    range: "Touch",
    duration: "Instantaneous",
    description:
      "This spell repairs a single break or tear in an object you touch, such as a broken chain link, two halves of a key, a torn cloak, or a leaking wineskin. The break or tear can be no larger than 1 foot in any dimension.",
  },
  {
    name: "Message",
    castingTime: "1 action",
    range: "120 feet",
    duration: "1 round",
    description:
      "You point toward a creature within range and whisper a message. The target hears the message and can whisper a reply that only you can hear. The spell can pass through solid objects if familiar with the target, but is blocked by magical silence, 1 foot of stone, 1 inch of common metal, lead, or 3 feet of wood or dirt.",
  },
  {
    name: "Minor Illusion",
    castingTime: "1 action",
    range: "30 feet",
    duration: "1 minute",
    description:
      "You create a sound or an image of an object within range. The sound lasts for the duration or the image fits in a 5-foot cube and is purely visual. A creature can use an action to inspect it and make an Intelligence (Investigation) check against your spell save DC to discern the illusion.",
  },
  {
    name: "Poison Spray",
    castingTime: "1 action",
    range: "10 feet",
    duration: "Instantaneous",
    description:
      "You extend your hand toward a creature you can see within range and project a puff of noxious gas. The creature must succeed on a Constitution saving throw or take 1d12 poison damage. Damage increases by 1d12 at 5th, 11th, and 17th level.",
  },
  {
    name: "Prestidigitation",
    castingTime: "1 action",
    range: "10 feet",
    duration: "Up to 1 hour",
    description:
      "You create a minor magical trick: a harmless sensory effect, light or snuff a flame, clean or soil a small object, chill, warm, or flavor nonliving material, make a mark or symbol, or create a nonmagical trinket or illusory image that fits in your hand.",
  },
  {
    name: "Ray of Frost",
    castingTime: "1 action",
    range: "60 feet",
    duration: "Instantaneous",
    description:
      "A frigid beam of blue-white light streaks toward a creature within range. Make a ranged spell attack. On a hit, it takes 1d8 cold damage and its speed is reduced by 10 feet until the start of your next turn. Damage increases by 1d8 at 5th, 11th, and 17th level.",
  },
  {
    name: "Resistance",
    castingTime: "1 action",
    range: "Touch",
    duration: "Concentration, up to 1 minute",
    description:
      "You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number rolled to one saving throw of its choice.",
  },
  {
    name: "Sacred Flame",
    castingTime: "1 action",
    range: "60 feet",
    duration: "Instantaneous",
    description:
      "Flame-like radiance descends on a creature you can see within range. The target must succeed on a Dexterity saving throw or take 1d8 radiant damage. The target gains no benefit from cover for this save. Damage increases by 1d8 at 5th, 11th, and 17th level.",
  },
  {
    name: "Shocking Grasp",
    castingTime: "1 action",
    range: "Touch",
    duration: "Instantaneous",
    description:
      "Lightning springs from your hand to a creature you try to touch. Make a melee spell attack with advantage if the target wears metal armor. On a hit, it takes 1d8 lightning damage and cannot take reactions until the start of its next turn. Damage increases by 1d8 at 5th, 11th, and 17th level.",
  },
  {
    name: "Spare the Dying",
    castingTime: "1 action",
    range: "Touch",
    duration: "Instantaneous",
    description:
      "You touch a living creature that has 0 hit points. The creature becomes stable. This spell has no effect on undead or constructs.",
  },
  {
    name: "Thorn Whip",
    castingTime: "1 action",
    range: "30 feet",
    duration: "Instantaneous",
    description:
      "You create a long vine-like whip covered in thorns that lashes out at a creature within range. Make a melee spell attack. On a hit, the target takes 1d6 piercing damage and, if it is Large or smaller, you pull it up to 10 feet closer. Damage increases by 1d6 at 5th, 11th, and 17th level.",
  },
  {
    name: "True Strike",
    castingTime: "1 action",
    range: "30 feet",
    duration: "Concentration, up to 1 round",
    description:
      "You point at a target in range. Your magic grants a brief insight into its defenses. On your next turn, you gain advantage on your first attack roll against that target, provided the spell has not ended.",
  },
  {
    name: "Vicious Mockery",
    castingTime: "1 action",
    range: "60 feet",
    duration: "Instantaneous",
    description:
      "You unleash a string of subtle insults at a creature that can hear you. It must succeed on a Wisdom saving throw or take 1d4 psychic damage and have disadvantage on the next attack roll it makes before the end of its next turn. Damage increases by 1d4 at 5th, 11th, and 17th level.",
  },
];
export const SRD_CANTRIP_BY_NAME = new Map(
  SRD_CANTRIPS.map((spell) => [spell.name, spell]),
);
SRD_CANTRIP_BY_NAME.set("Friends", {
  name: "Friends",
  castingTime: "1 action",
  range: "Self",
  duration: "Concentration, up to 1 minute",
  description:
    "For the duration, you have advantage on all Charisma checks directed at one creature of your choice that is not hostile toward you. When the spell ends, the creature realizes you used magic to influence its mood and may become hostile.",
});
SRD_CANTRIP_BY_NAME.set("Produce Flame", {
  name: "Produce Flame",
  castingTime: "1 action",
  range: "Self",
  duration: "10 minutes",
  description:
    "A flickering flame appears in your hand. It sheds bright light for 10 feet and dim light for 10 more. You can hurl it at a creature within 30 feet; make a ranged spell attack. On a hit, it takes 1d8 fire damage. Damage increases by 1d8 at 5th, 11th, and 17th level.",
});
SRD_CANTRIP_BY_NAME.set("Shillelagh", {
  name: "Shillelagh",
  castingTime: "1 bonus action",
  range: "Touch",
  duration: "1 minute",
  description:
    "The wood of a club or quarterstaff you hold is imbued with nature's power. Its damage die becomes a d8, it becomes magical, and you can use your spellcasting ability instead of Strength for attack and damage rolls.",
});
SRD_CANTRIP_BY_NAME.set("Thaumaturgy", {
  name: "Thaumaturgy",
  castingTime: "1 action",
  range: "30 feet",
  duration: "Up to 1 minute",
  description:
    "You manifest a minor wonder: your voice booms, flames flicker, harmless tremors occur, a door or window flies open or shut, sounds originate from a point, your eyes change appearance, or a harmless sensory effect appears. You can have up to three effects active at once.",
});
export const formatSrdCantrip = (name: string): string => {
  const spell = SRD_CANTRIP_BY_NAME.get(name);
  return spell
    ? `${spell.name}. Casting Time: ${spell.castingTime}. Range: ${spell.range}. Duration: ${spell.duration}. ${spell.description}`
    : name;
};
export const WIZARD_CANTRIPS = [
  "Acid Splash",
  "Blade Ward",
  "Chill Touch",
  "Dancing Lights",
  "Fire Bolt",
  "Friends",
  "Light",
  "Mage Hand",
  "Mending",
  "Message",
  "Minor Illusion",
  "Poison Spray",
  "Prestidigitation",
  "Ray of Frost",
  "Shocking Grasp",
  "True Strike",
] as const;

export const DRAGON_LINEAGES: readonly DragonLineage[] = [
  { name: "Black", damage: "Acid" },
  { name: "Blue", damage: "Lightning" },
  { name: "Brass", damage: "Fire" },
  { name: "Bronze", damage: "Lightning" },
  { name: "Copper", damage: "Acid" },
  { name: "Gold", damage: "Fire" },
  { name: "Green", damage: "Poison" },
  { name: "Red", damage: "Fire" },
  { name: "Silver", damage: "Cold" },
  { name: "White", damage: "Cold" },
];

export const POWERS: readonly PowerDefinition[] = [
  {
    id: "mind-lance",
    name: "Mind Lance",
    summary:
      "Once per long rest: one creature within 30 ft. makes an Intelligence save or takes 1d6 psychic damage.",
  },
  {
    id: "kinetic-hand",
    name: "Kinetic Hand",
    summary:
      "Once per long rest: move an unattended object weighing 10 lb. or less up to 15 ft. within a 30-ft. range.",
  },
  {
    id: "force-screen",
    name: "Force Screen",
    summary:
      "Once per long rest, when hit: use your reaction to gain +2 AC against the triggering attack.",
  },
  {
    id: "slip-between",
    name: "Slip Between",
    summary:
      "Once per long rest: use a bonus action to teleport up to 10 ft. to a space you can see.",
  },
  {
    id: "danger-flash",
    name: "Danger Flash",
    summary:
      "Once per long rest: use your reaction to add 1d4 to your ability check or save before the outcome is declared.",
  },
  {
    id: "thoughtlink",
    name: "Thoughtlink",
    summary:
      "Once per long rest: share two-way telepathy with a willing creature for 10 minutes.",
  },
  {
    id: "iron-flesh",
    name: "Iron Flesh",
    summary:
      "Once per long rest: use a bonus action to gain 1d4 + proficiency bonus temporary HP.",
  },
  {
    id: "sandshape",
    name: "Sandshape",
    summary:
      "Once per long rest: make one 5-ft. square of loose earth difficult or normal terrain for 10 minutes.",
  },
];

export const OCCUPATIONS: readonly OccupationDefinition[] = [
  { id: 1, name: "Wretch", gear: "Nothing", proficiency: "Nothing" },
  {
    id: 2,
    name: "Stone Cutter",
    gear: "Mason's hammer",
    proficiency: "Mason's tools",
  },
  {
    id: 3,
    name: "Temple Servant",
    gear: "Stone amulet dedicated to an elemental spirit",
    proficiency: "Religion",
  },
  {
    id: 4,
    name: "Potter",
    gear: "Nothing",
    proficiency: "Mending once per day",
    special: "mending",
  },
  {
    id: 5,
    name: "Basket Weaver",
    gear: "Nothing",
    proficiency: "Sleight of Hand",
  },
  { id: 6, name: "Fisher", gear: "Nothing", proficiency: "Water vehicles" },
  {
    id: 7,
    name: "Obsidian Knapper",
    gear: "3 obsidian daggers",
    proficiency: "Nothing",
  },
  { id: 8, name: "Storyteller", gear: "Nothing", proficiency: "Persuasion" },
  {
    id: 9,
    name: "Slave Cook",
    gear: "1 healing salve",
    proficiency: "Nothing",
  },
  {
    id: 10,
    name: "Assistant Scribe",
    gear: "Nothing",
    proficiency: "Investigation",
  },
  { id: 11, name: "Grave Keeper", gear: "Nothing", proficiency: "Medicine" },
  {
    id: 12,
    name: "Grave Robber",
    gear: "1 crude lockpick",
    proficiency: "Thieves' tools",
  },
  { id: 13, name: "Outcast", gear: "Nothing", proficiency: "Survival" },
  { id: 14, name: "Caravaner", gear: "Nothing", proficiency: "Nature" },
  {
    id: 15,
    name: "Gladiator's Squire",
    gear: "Dirty bandana",
    proficiency: "Martial weapons",
  },
  {
    id: 16,
    name: "Failed Noble",
    gear: "Silver signet ring",
    proficiency: "Nothing",
  },
  { id: 17, name: "Goatherd", gear: "Nothing", proficiency: "Animal Handling" },
  {
    id: 18,
    name: "Mystic",
    gear: "4 crumpled tarot cards",
    proficiency: "Arcana",
  },
  {
    id: 19,
    name: "Budding Mage",
    gear: "Nothing",
    proficiency: "One SRD cantrip",
    special: "cantrip",
  },
  {
    id: 20,
    name: "Rogue Talent",
    gear: "Nothing",
    proficiency: "One psionic power",
    special: "power",
  },
];

export const TRINKETS: readonly TrinketDefinition[] = [
  {
    id: 1,
    text: "A tiny bronze bell. It only makes a sound when it strikes something with value.",
  },
  { id: 2, text: "A fist-sized pumice stone, light enough to float on water." },
  { id: 3, text: "A lump of wax mixed with fragrant herbs." },
  { id: 4, text: "A tiny clay idol missing its head." },
  { id: 5, text: "A small stone figurine of a man with four arms." },
  {
    id: 6,
    text: "A faded strip of parchment showing part of a forgotten map.",
  },
  { id: 7, text: "A pair of carved knucklebones used for gambling." },
  {
    id: 8,
    text: "A tiny corked vial containing a pinch of brilliantly coloured sand.",
  },
  {
    id: 9,
    text: "A palm-sized piece of obsidian shaped like a crescent moon.",
  },
  { id: 10, text: "A bumblebee encased in a lump of fragrant amber resin." },
  {
    id: 11,
    text: "A cracked bronze mirror that reflects your face strangely.",
  },
  {
    id: 12,
    text: "A dried blue flower pressed between two scraps of leather.",
  },
  { id: 13, text: "A tiny bone whistle that emits almost no sound." },
  {
    id: 14,
    text: "A length of faded red cloth embroidered with unknown symbols.",
  },
  { id: 15, text: "An empty clay jar that rattles when shaken." },
  { id: 16, text: "A leather cord tied to a single shark tooth." },
  { id: 17, text: "A polished ocean shell. Have you even seen the ocean?" },
  {
    id: 18,
    text: "Three brightly coloured feathers tied together with twine.",
  },
  { id: 19, text: "A smooth obsidian disk, made for viewing eclipses." },
  {
    id: 20,
    text: "A small figurine made of cloth and twigs. It smells faintly of smoke.",
  },
];

const trait = (
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

export const ANCESTRIES: readonly AncestryDefinition[] = [
  {
    id: "deep-dwarf",
    name: "Deep Dwarf",
    category: "common",
    fixedBonuses: { con: 2, str: 1 },
    size: "Medium",
    speed: 25,
    languages: ["Common", "Undercommon"],
    traits: [
      trait(
        "darkvision",
        "Darkvision",
        "See in darkness to 60 ft. as dim light.",
      ),
      trait(
        "resilience",
        "Dwarven Resilience",
        "Advantage on saves against poison and resistance to poison damage.",
      ),
      trait(
        "tool",
        "Tool Proficiency",
        "Gain one tool proficiency related to your Focus.",
      ),
      trait(
        "knowledge",
        "Well of Knowledge",
        "For Intelligence checks about your Focus, gain proficiency and double proficiency bonus.",
      ),
      trait(
        "rune",
        "Runic Carving",
        "A carved rune glows within 20 ft. of its chosen creature or item type.",
      ),
    ],
    nameProfile: {
      style: "family",
      given: [
        "Birgaz",
        "Drog",
        "Ghedran",
        "Gram",
        "Jurgan",
        "Kov",
        "Krom",
        "Murd",
        "Thurin",
        "Zareb",
        "Bral",
        "Cala",
        "Fyra",
        "Kesi",
        "Ursel",
        "Davra",
      ],
      second: [
        "Silverstone",
        "Deepdelver",
        "Torevir",
        "Rakankrak",
        "Embervein",
        "Ironwake",
        "Dustmantle",
        "Flintward",
      ],
    },
  },
  {
    id: "human",
    name: "Human",
    category: "common",
    fixedBonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
    size: "Medium",
    speed: 30,
    languages: ["Common"],
    traits: [
      trait("skilled", "Skilled", "Gain one tool proficiency."),
      trait("staying-power", "Staying Power", "Gain two additional Hit Dice."),
      trait(
        "detect",
        "Detect the Unnatural",
        "Bonus action: until next turn, sense supernatural objects, constructs, undead, and extraplanar creatures within 5 ft.",
      ),
    ],
    nameProfile: {
      style: "single",
      given: [
        "Agu",
        "Banoc",
        "Fayad",
        "Musab",
        "Naasif",
        "Sufyan",
        "Umair",
        "Asma",
        "Jumana",
        "Khaleela",
        "Minnah",
        "Noori",
        "Rafiqa",
        "Safia",
        "Azir",
        "Nahla",
        "Qadir",
        "Sahra",
      ],
    },
  },
  {
    id: "sand-dwarf",
    name: "Sand Dwarf",
    category: "common",
    fixedBonuses: { con: 1 },
    size: "Medium",
    speed: 30,
    languages: ["Common", "Dukhet"],
    traits: [
      trait(
        "danger",
        "Danger Sense",
        "Gain Perception proficiency and tremorsense 5 ft., increasing to 30 ft. while buried in sand.",
      ),
      trait(
        "concealment",
        "Natural Concealment",
        "Spend 10 minutes hiding as a natural feature, or 1 minute in sand; may conceal an ally.",
      ),
      trait(
        "hunter",
        "Hunter in Wait",
        "Ignore sandy difficult terrain; while concealed, stand for 5 ft. and Dash as a bonus action.",
      ),
    ],
    nameProfile: {
      style: "single",
      given: [
        "Amenmen",
        "Nesahor",
        "Osirei",
        "Menepthah",
        "Nkulu",
        "Antef",
        "Nofretari",
        "Pasht",
        "Nubukha",
        "Tutul",
        "Souban",
        "Khemet",
        "Sahure",
        "Merit",
      ],
    },
  },
  {
    id: "smallfolk",
    name: "Smallfolk",
    category: "common",
    fixedBonuses: { dex: 2, cha: 1 },
    size: "Small",
    speed: 25,
    languages: ["Common"],
    traits: [
      trait(
        "lucky",
        "Lucky",
        "Reroll a 1 on an attack, check, or save; use the new roll.",
      ),
      trait(
        "fearless",
        "Fearless",
        "Advantage on saves against being frightened.",
      ),
      trait(
        "nimble",
        "Nimble",
        "Move through the space of creatures larger than you.",
      ),
      trait(
        "stealthy",
        "Stealthy",
        "Hide when obscured only by a larger creature.",
      ),
    ],
    nameProfile: {
      style: "family",
      given: [
        "Agatha",
        "Aimsley",
        "Broderick",
        "Amaryllis",
        "Beverly",
        "Marceline",
        "Modesty",
        "Penelope",
        "Ursula",
        "Perrin",
        "Mallow",
        "Tansy",
      ],
      second: [
        "Bancroft",
        "Beechwood",
        "Billingsworth",
        "Langston",
        "Owlswick",
        "Weatherly",
        "Cinderpot",
        "Thistlewick",
      ],
    },
  },
  {
    id: "sun-elf",
    name: "Sun Elf",
    category: "common",
    fixedBonuses: { dex: 2, int: 1 },
    size: "Medium",
    speed: 40,
    languages: ["Common", "Dukhet"],
    traits: [
      trait("keen", "Keen Senses", "Gain Perception proficiency."),
      trait(
        "fey",
        "Fey Ancestry",
        "Advantage against charm; magic cannot put you to sleep.",
      ),
      trait(
        "wild",
        "Wild Heritage",
        "Gain one weapon proficiency and one Wizard cantrip with a chosen casting ability.",
      ),
      trait("trance", "Trance", "Four hours of meditation grants a full rest."),
      trait("step", "Fey Step", "Cast Misty Step once per short or long rest."),
      trait(
        "athlete",
        "Effortless Athlete",
        "Ignore loose-sand difficult terrain and gain advantage against Exhaustion.",
      ),
    ],
    nameProfile: {
      style: "single",
      given: [
        "Abyuuk",
        "Arvos",
        "Barak",
        "Corannu",
        "Darzus",
        "Faenaeyon",
        "Guvanno",
        "Jirah",
        "Kathak",
        "Nefen",
        "Radurak",
        "Alaa",
        "Areela",
        "Enala",
        "Jeila",
        "Nuuta",
        "Tamana",
        "Yalana",
        "Zoruun",
        "Kaeli",
      ],
    },
  },
  {
    id: "beastkin",
    name: "Beastkin",
    category: "exotic",
    fixedBonuses: { dex: 2, wis: 1 },
    size: "Medium",
    speed: 30,
    languages: ["Common", "Dukhet"],
    traits: [
      trait(
        "darkvision",
        "Darkvision",
        "See in darkness to 60 ft. as dim light.",
      ),
      trait("instinct", "Wasteland Instinct", "Gain Survival proficiency."),
    ],
    nameProfile: {
      style: "title",
      given: [
        "Bot",
        "Cael",
        "Drimm",
        "Faz",
        "Mod",
        "Nix",
        "Sylph",
        "Ven",
        "Ruk",
        "Tarn",
        "Yip",
        "Kesh",
      ],
      second: [
        "Swiftclaw",
        "Farleap",
        "Bloodjaw",
        "Proudmane",
        "Dustsnout",
        "Nightpelt",
        "Brightfang",
        "Ashmane",
      ],
    },
  },
  {
    id: "dragonkin",
    name: "Dragonkin",
    category: "exotic",
    fixedBonuses: { str: 2, cha: 1 },
    size: "Medium",
    speed: 30,
    languages: ["Common", "Primeld"],
    traits: [],
    nameProfile: {
      style: "family",
      given: [
        "Aarkizovar",
        "Dannorax",
        "Killexiriax",
        "Koraavinam",
        "Vanazor",
        "Zexijorovox",
        "Ahrijiinad",
        "Cyrrijox",
        "Kalliarx",
        "Orrizarviox",
        "Vharaxion",
        "Kezzira",
      ],
      second: [
        "Lyrelkin",
        "Brorsson",
        "Faelsdotter",
        "Son of Vaedel",
        "Daughter of Symbelline",
        "Ash-Oath",
        "Emberward",
      ],
    },
  },
  {
    id: "shifter",
    name: "Shifter",
    category: "exotic",
    fixedBonuses: { con: 2 },
    size: "Medium",
    speed: 30,
    languages: ["Common", "Dukhet"],
    traits: [
      trait(
        "darkvision",
        "Darkvision",
        "See in darkness to 60 ft. as dim light.",
      ),
      trait(
        "shifting",
        "Shifting",
        "Once per short or long rest, shift for 1 minute and gain temporary HP equal to level + Constitution modifier, minimum 1.",
      ),
    ],
    nameProfile: {
      style: "title",
      given: [
        "Bot",
        "Cael",
        "Drimm",
        "Faz",
        "Mod",
        "Nix",
        "Sylph",
        "Ven",
        "Rusk",
        "Thorn",
        "Vek",
        "Zai",
      ],
      second: [
        "Swiftclaw",
        "Farleap",
        "Bloodjaw",
        "Proudmane",
        "Stonehide",
        "Longstride",
        "Sandeye",
        "Redfang",
      ],
    },
  },
  {
    id: "warforged",
    name: "Warforged",
    category: "exotic",
    fixedBonuses: { con: 2 },
    size: "Medium",
    speed: 30,
    languages: ["Common"],
    traits: [
      trait(
        "resilience",
        "Constructed Resilience",
        "Resist poison, gain advantage against poison, ignore disease, food, drink, air, and magical sleep.",
      ),
      trait(
        "rest",
        "Sentry's Rest",
        "Long rest while inactive but conscious for at least 6 hours.",
      ),
      trait(
        "armour",
        "Integrated Armour",
        "Gain +1 AC and incorporate proficient armor into your body.",
      ),
      trait(
        "design",
        "Specialized Design",
        "Gain one skill and one tool proficiency.",
      ),
    ],
    nameProfile: {
      style: "purpose",
      given: [
        "Sentry",
        "Courier",
        "Battery",
        "Discovery",
        "Horizon",
        "Anchor",
        "Cinder",
        "Compass",
        "Rampart",
        "Relay",
        "Shelter",
        "Witness",
      ],
    },
  },
  {
    id: "yuan-ti",
    name: "Yuan-Ti",
    category: "exotic",
    fixedBonuses: { cha: 2, int: 1 },
    size: "Medium",
    speed: 30,
    languages: ["Common", "Primeld"],
    traits: [
      trait(
        "darkvision",
        "Darkvision",
        "See in darkness to 60 ft. as dim light.",
      ),
      trait(
        "heritage",
        "Serpentine Heritage",
        "Advantage against spells and poison, poison resistance, and ignore loose-sand difficult terrain.",
      ),
      trait(
        "echoes",
        "Echoes of the Past",
        "After each long rest, choose one skill and one weapon or tool proficiency until the next rest.",
      ),
      trait(
        "spellcasting",
        "Innate Spellcasting",
        "At level 3, cast Enhance Ability on yourself once each dawn.",
      ),
    ],
    nameProfile: {
      style: "single",
      given: [
        "Coatl",
        "Nochehuatl",
        "Huitztecol",
        "Tezozomoc",
        "Nochcoatl",
        "Ezcoatl",
        "Nenetl",
        "Amoxtli",
        "Necahual",
        "Patli",
        "Xochilaloni",
        "Mizlihuitl",
        "Itzacoatl",
        "Yaretzi",
      ],
    },
  },
  {
    id: "orken",
    name: "Orken",
    category: "uncommon",
    fixedBonuses: { str: 2, con: 1 },
    size: "Medium",
    speed: 30,
    languages: ["Common", "Dukhet"],
    traits: [
      trait(
        "darkvision",
        "Darkvision",
        "See in darkness to 60 ft. as dim light.",
      ),
      trait("menacing", "Menacing", "Gain Intimidation proficiency."),
      trait(
        "rush",
        "Bloodfire Rush",
        "On round one or after taking damage, speed increases 10 ft. until next turn; once per round.",
      ),
      trait(
        "relentless",
        "Relentless",
        "When dropped to 0 HP, make one advantaged weapon attack; if it drops a foe, spend a Hit Die immediately.",
      ),
    ],
    nameProfile: {
      style: "single",
      given: [
        "Dezovor",
        "Dhorovek",
        "Korjok",
        "Medozoar",
        "Rojak",
        "Uvarsk",
        "Vordokov",
        "Askilli",
        "Karoskha",
        "Khorva",
        "Vakarra",
        "Zhorva",
        "Dravok",
        "Morzha",
      ],
    },
  },
  {
    id: "tiefling",
    name: "Tiefling",
    category: "uncommon",
    fixedBonuses: { cha: 2, int: 1 },
    size: "Medium",
    speed: 30,
    languages: ["Common", "Infernal"],
    traits: [
      trait(
        "resistance",
        "Hellish Resistance",
        "Gain resistance to fire damage.",
      ),
    ],
    nameProfile: {
      style: "single",
      given: [
        "Carxik",
        "Amthus",
        "Morzire",
        "Lokemarir",
        "Malzer",
        "Valadius",
        "Thynelius",
        "Mafaris",
        "Rihala",
        "Sharissa",
        "Valmaia",
        "Samine",
        "Zarik",
        "Calithra",
      ],
    },
  },
  {
    id: "wode-elf",
    name: "Wode Elf",
    category: "uncommon",
    fixedBonuses: { dex: 2, wis: 1 },
    size: "Medium",
    speed: 30,
    languages: ["Common", "Fairspeak"],
    traits: [
      trait(
        "darkvision",
        "Darkvision",
        "See in darkness to 60 ft. as dim light.",
      ),
      trait("keen", "Keen Senses", "Gain Perception proficiency."),
      trait(
        "fey",
        "Fey Ancestry",
        "Advantage against charm; magic cannot put you to sleep.",
      ),
      trait("trance", "Trance", "Four hours of meditation grants a full rest."),
      trait(
        "mask",
        "Mask of the Wode",
        "Hide while lightly obscured by natural phenomena.",
      ),
      trait(
        "defends",
        "The Wode Defends",
        "Know Thorn Whip; later gain Entangle and Barkskin once per long rest.",
      ),
    ],
    nameProfile: {
      style: "single",
      given: [
        "Calliarwyc",
        "Cillyv",
        "Gwyllmach",
        "Llyandros",
        "Radiarwyn",
        "Elvyr",
        "Nimu�",
        "Rhegyth",
        "Viarwyn",
        "Ysallwyth",
        "Myrdden",
        "Aelwyc",
      ],
    },
  },
];

export const ANCESTRY_BY_ID = new Map(
  ANCESTRIES.map((item) => [item.id, item]),
);
export const OCCUPATION_BY_ID = new Map(
  OCCUPATIONS.map((item) => [item.id, item]),
);
export const TRINKET_BY_ID = new Map(TRINKETS.map((item) => [item.id, item]));
export const POWER_BY_ID = new Map(POWERS.map((item) => [item.id, item]));
