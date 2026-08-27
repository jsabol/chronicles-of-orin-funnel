export const ABILITIES = ["str", "dex", "con", "int", "wis", "cha"] as const

export type Ability = (typeof ABILITIES)[number]
export type AbilityScores = Record<Ability, number>
export type CharacterStatus = "living" | "deceased"
export type PaperSize = "letter" | "a4"

export interface AncestryChoices {
  abilityBoost?: Ability
  languages?: string[]
  tool?: string
  skill?: string
  weapon?: string
  cantrip?: string
  spellcastingAbility?: "int" | "wis" | "cha"
  focus?: string
  runeTarget?: string
  adaptation?: string
  dragonLineage?: string
  secondaryDragonLineage?: string
  traits?: string[]
  shift?: string
  scar?: string
}

export interface OccupationChoices {
  cantrip?: string
  power?: string
}

export interface CharacterRecordV1 {
  schemaVersion: 1
  id: string
  batchId: string
  createdAt: string
  updatedAt: string
  name: string
  rawAbilities: AbilityScores
  hpRoll: number
  ancestryId: string
  ancestryChoices: AncestryChoices
  occupationId: number
  occupationChoices: OccupationChoices
  trinketId: number
  trinketAnswer: string
  fateOverride?: CharacterStatus
  causeOfDeath?: string
}

export interface StoredDataV1 {
  version: 1
  characters: CharacterRecordV1[]
  paperSize: PaperSize
}

export interface TraitDefinition {
  id: string
  name: string
  summary: string
  points?: number
}

export interface NameProfile {
  style: "single" | "family" | "title" | "purpose"
  given: readonly string[]
  second?: readonly string[]
}

export interface AncestryDefinition {
  id: string
  name: string
  category: "common" | "uncommon" | "exotic"
  fixedBonuses: Partial<AbilityScores>
  size: string
  speed: number
  languages: readonly string[]
  traits: readonly TraitDefinition[]
  nameProfile: NameProfile
}

export interface OccupationDefinition {
  id: number
  name: string
  gear: string
  proficiency: string
  special?: "mending" | "cantrip" | "power"
}

export interface TrinketDefinition {
  id: number
  text: string
}

export interface PowerDefinition {
  id: string
  name: string
  summary: string
}

export interface DragonLineage {
  name: string
  damage: string
}

export interface DerivedCharacter {
  record: CharacterRecordV1
  ancestry: AncestryDefinition
  occupation: OccupationDefinition
  trinket: TrinketDefinition
  finalAbilities: AbilityScores
  modifiers: AbilityScores
  proficiencyBonus: number
  armorClass: number
  maxHp: number
  status: CharacterStatus
  hitDice: string
  speed: number
  size: string
  languages: string[]
  proficiencies: string[]
  gear: string[]
  traits: TraitDefinition[]
  magic: string[]
}
