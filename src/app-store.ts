import { createCharacterStore } from "./storage";
export const store = createCharacterStore();
export const asset = (name: string) =>
  `${import.meta.env.BASE_URL}assets/${name}`;
