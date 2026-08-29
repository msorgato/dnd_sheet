import type { Character, RollResultData } from '../../types'
import { getSpecies } from '../../data/species'
import { effectiveAbilityScores, maxHitPoints, armorClassUnarmored } from '../../utils/calculations'
import { resolveClass } from '../../utils/classLookup'
import { DiceRoller } from '../sheet/DiceRoller'

interface Props {
  character: Character | null
  loading?: boolean
  onRollResult: (result: RollResultData) => void
}

export function LobbySheetPanel({ character, loading, onRollResult }: Props) {
  if (loading) {
    return <p className="p-4 text-center text-sm text-[var(--theme-text-mute)]">Caricamento scheda…</p>
  }

  if (!character) {
    return <p className="p-4 text-center text-sm text-[var(--theme-text-mute)]">Seleziona un personaggio per vedere la scheda.</p>
  }

  const species = getSpecies(character.speciesId)
  const primaryClass = resolveClass(character.classes[0]?.classId ?? '')
  const scores = effectiveAbilityScores(character)

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
      <div className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
        <p className="truncate text-sm font-bold text-[var(--theme-accent-bright)]">{character.name || '(senza nome)'}</p>
        <p className="text-xs text-[var(--theme-text-mute)]">
          {species?.name} · {primaryClass?.name} liv. {character.totalLevel}
        </p>
        <div className="mt-2 flex gap-3 text-xs text-[var(--theme-text-soft)]">
          <span>
            PF {character.currentHp}/{maxHitPoints(character)}
          </span>
          <span>CA {armorClassUnarmored(scores)}</span>
        </div>
      </div>

      <DiceRoller characterName={character.name} onRollResult={onRollResult} />
    </div>
  )
}
