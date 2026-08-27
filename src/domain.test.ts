import { describe, expect, it } from "vitest"
import { ANCESTRIES, OCCUPATIONS, TRINKETS } from "./data"
import { abilityModifier, createCharacter, createFunnelBatch, deriveCharacter, finalAbilityScores, rollAbility, type RandomSource, validateCharacter } from "./domain"

const fixed = (values: number[]): RandomSource => {
  let i = 0
  return { int: (max) => values[i++ % values.length]! % max }
}

describe("funnel rules", () => {
  it("rolls 4d6 and drops the lowest", () => expect(rollAbility(fixed([0, 1, 2, 5]))).toBe(11))
  it("floors negative modifiers", () => expect(abilityModifier(9)).toBe(-1))
  it("contains exactly the permitted ancestries and d20 tables", () => {
    expect(ANCESTRIES).toHaveLength(13)
    expect(ANCESTRIES.map(a => a.id)).not.toContain("goliath")
    expect(OCCUPATIONS).toHaveLength(20)
    expect(TRINKETS).toHaveLength(20)
  })
  it("applies ancestry increases and derives HP and AC", () => {
    const c=createCharacter("batch",fixed([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]))
    c.ancestryId="beastkin";c.ancestryChoices={adaptation:"tough-hide"};c.rawAbilities={str:9,dex:12,con:9,int:10,wis:10,cha:10};c.hpRoll=1
    expect(finalAbilityScores(c).dex).toBe(14)
    const d=deriveCharacter(c)
    expect(d.armorClass).toBe(11)
    expect(d.maxHp).toBe(0)
    expect(d.status).toBe("living")
    c.hpRoll=0
    expect(deriveCharacter(c).status).toBe("deceased")
  })
  it("retains deaths while rolling until four living characters exist", () => {
    const batch=createFunnelBatch(fixed([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,4,5]))
    expect(batch.filter(c=>deriveCharacter(c).status==="living")).toHaveLength(4)
  })
  it("validates ancestry point budgets", () => {
    const c=createCharacter("batch")
    c.ancestryId="tiefling";c.ancestryChoices={traits:[]}
    expect(validateCharacter(c).join(" ")).toMatch(/exactly 3/)
  })
})
