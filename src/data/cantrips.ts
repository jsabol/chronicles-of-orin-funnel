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
