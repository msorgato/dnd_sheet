import type { AbilityKey, AbilityScores, Character } from '../types'

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function proficiencyBonus(characterLevel: number): number {
  return 2 + Math.floor((characterLevel - 1) / 4)
}

export function armorClassUnarmored(scores: AbilityScores): number {
  return 10 + abilityModifier(scores.dex)
}

export function initiative(scores: AbilityScores): number {
  return abilityModifier(scores.dex)
}

export function savingThrowBonus(
  scores: AbilityScores,
  ability: AbilityKey,
  level: number,
  isProficient: boolean,
): number {
  const bonus = abilityModifier(scores[ability])
  return isProficient ? bonus + proficiencyBonus(level) : bonus
}

export function skillBonus(
  scores: AbilityScores,
  ability: AbilityKey,
  level: number,
  isProficient: boolean,
  hasExpertise = false,
): number {
  const bonus = abilityModifier(scores[ability])
  if (!isProficient) return bonus
  return bonus + proficiencyBonus(level) * (hasExpertise ? 2 : 1)
}

export function effectiveAbilityScores(character: Pick<Character, 'baseAbilityScores' | 'backgroundAbilityBonus'>): AbilityScores {
  const { baseAbilityScores, backgroundAbilityBonus } = character
  const abilities: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']
  return abilities.reduce((scores, key) => {
    scores[key] = baseAbilityScores[key] + (backgroundAbilityBonus[key] ?? 0)
    return scores
  }, {} as AbilityScores)
}

export function totalCharacterLevel(character: Pick<Character, 'classes'>): number {
  return character.classes.reduce((sum, entry) => sum + entry.level, 0)
}

export function maxHitPoints(
  character: Pick<Character, 'hitPointsRolled' | 'baseAbilityScores' | 'backgroundAbilityBonus'>,
): number {
  const conMod = abilityModifier(effectiveAbilityScores(character).con)
  const rolled = character.hitPointsRolled.reduce((sum, roll) => sum + roll, 0)
  return rolled + conMod * character.hitPointsRolled.length
}
