import type { NameProfile } from "../../types";
import { DEEP_DWARF_NAMES } from "./names-deep-dwarf";
import { HUMAN_NAMES } from "./names-human";
import { SAND_DWARF_NAMES } from "./names-sand-dwarf";
import { SMALLFOLK_NAMES } from "./names-smallfolk";
import { SUN_ELF_NAMES } from "./names-sun-elf";
import { BEASTKIN_NAMES } from "./names-beastkin";
import { DRAGONKIN_NAMES } from "./names-dragonkin";
import { SHIFTER_NAMES } from "./names-shifter";
import { WARFORGED_NAMES } from "./names-warforged";
import { YUAN_TI_NAMES } from "./names-yuan-ti";
import { ORKEN_NAMES } from "./names-orken";
import { TIEFLING_NAMES } from "./names-tiefling";
import { WODE_ELF_NAMES } from "./names-wode-elf";

export { DEEP_DWARF_NAMES } from "./names-deep-dwarf";
export { HUMAN_NAMES } from "./names-human";
export { SAND_DWARF_NAMES } from "./names-sand-dwarf";
export { SMALLFOLK_NAMES } from "./names-smallfolk";
export { SUN_ELF_NAMES } from "./names-sun-elf";
export { BEASTKIN_NAMES } from "./names-beastkin";
export { DRAGONKIN_NAMES } from "./names-dragonkin";
export { SHIFTER_NAMES } from "./names-shifter";
export { WARFORGED_NAMES } from "./names-warforged";
export { YUAN_TI_NAMES } from "./names-yuan-ti";
export { ORKEN_NAMES } from "./names-orken";
export { TIEFLING_NAMES } from "./names-tiefling";
export { WODE_ELF_NAMES } from "./names-wode-elf";

export const NAME_PROFILES: Record<string, NameProfile> = {
  "deep-dwarf": DEEP_DWARF_NAMES,
  human: HUMAN_NAMES,
  "sand-dwarf": SAND_DWARF_NAMES,
  smallfolk: SMALLFOLK_NAMES,
  "sun-elf": SUN_ELF_NAMES,
  beastkin: BEASTKIN_NAMES,
  dragonkin: DRAGONKIN_NAMES,
  shifter: SHIFTER_NAMES,
  warforged: WARFORGED_NAMES,
  "yuan-ti": YUAN_TI_NAMES,
  orken: ORKEN_NAMES,
  tiefling: TIEFLING_NAMES,
  "wode-elf": WODE_ELF_NAMES,
};
