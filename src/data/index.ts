export * from "./catalogs";
export * from "./cantrips";
export * from "./dragons";
export * from "./powers";
export * from "./occupations";
export * from "./trinkets";
export * from "./ancestry-options";
export * from "./names";
export * from "./ancestries";

import { ANCESTRIES } from "./ancestries";
import { OCCUPATIONS } from "./occupations";
import { POWERS } from "./powers";
import { TRINKETS } from "./trinkets";

export const ANCESTRY_BY_ID = new Map(ANCESTRIES.map((item) => [item.id, item]));
export const OCCUPATION_BY_ID = new Map(OCCUPATIONS.map((item) => [item.id, item]));
export const TRINKET_BY_ID = new Map(TRINKETS.map((item) => [item.id, item]));
export const POWER_BY_ID = new Map(POWERS.map((item) => [item.id, item]));
