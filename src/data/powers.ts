import type { PowerDefinition } from "../types";

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
