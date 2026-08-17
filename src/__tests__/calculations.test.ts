import { describe, it, expect } from 'vitest'
import {
  abilityModifier,
  proficiencyBonus,
  armorClassUnarmored,
  initiative,
  savingThrowBonus,
  skillBonus,
} from '../utils/calculations'
import type { AbilityScores } from '../types'

describe('abilityModifier', () => {
  it('returns 0 for a score of 10 or 11', () => {
    expect(abilityModifier(10)).toBe(0)
    expect(abilityModifier(11)).toBe(0)
  })

  it('rounds down for odd scores below 10', () => {
    expect(abilityModifier(8)).toBe(-1)
    expect(abilityModifier(9)).toBe(-1)
  })

  it('handles the top and bottom of the standard range', () => {
    expect(abilityModifier(1)).toBe(-5)
    expect(abilityModifier(20)).toBe(5)
  })
})

describe('proficiencyBonus', () => {
  it('is +2 for levels 1-4', () => {
    expect(proficiencyBonus(1)).toBe(2)
    expect(proficiencyBonus(4)).toBe(2)
  })

  it('increases at each 4-level threshold', () => {
    expect(proficiencyBonus(5)).toBe(3)
    expect(proficiencyBonus(8)).toBe(3)
    expect(proficiencyBonus(9)).toBe(4)
    expect(proficiencyBonus(12)).toBe(4)
    expect(proficiencyBonus(13)).toBe(5)
    expect(proficiencyBonus(16)).toBe(5)
    expect(proficiencyBonus(17)).toBe(6)
    expect(proficiencyBonus(20)).toBe(6)
  })
})

const baseScores: AbilityScores = { str: 10, dex: 14, con: 12, int: 8, wis: 13, cha: 16 }

describe('armorClassUnarmored', () => {
  it('is 10 plus the Dex modifier', () => {
    expect(armorClassUnarmored(baseScores)).toBe(12)
  })
})

describe('initiative', () => {
  it('equals the Dex modifier', () => {
    expect(initiative(baseScores)).toBe(2)
  })
})

describe('savingThrowBonus', () => {
  it('applies only the ability modifier when not proficient', () => {
    expect(savingThrowBonus(baseScores, 'int', 1, false)).toBe(-1)
  })

  it('adds the proficiency bonus for the character level when proficient', () => {
    expect(savingThrowBonus(baseScores, 'cha', 5, true)).toBe(3 + 3)
  })
})

describe('skillBonus', () => {
  it('applies only the ability modifier when not proficient', () => {
    expect(skillBonus(baseScores, 'dex', 1, false)).toBe(2)
  })

  it('adds the proficiency bonus once when proficient', () => {
    expect(skillBonus(baseScores, 'dex', 1, true)).toBe(2 + 2)
  })

  it('doubles the proficiency bonus with expertise', () => {
    expect(skillBonus(baseScores, 'dex', 5, true, true)).toBe(2 + 3 * 2)
  })
})
