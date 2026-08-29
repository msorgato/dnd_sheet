import type { AbilityKey, AbilityScores } from '../../types'
import { abilityModifier, savingThrowBonus } from '../../utils/calculations'

const ABILITY_LABELS: Record<AbilityKey, string> = {
  str: 'Forza',
  dex: 'Destrezza',
  con: 'Costituzione',
  int: 'Intelligenza',
  wis: 'Saggezza',
  cha: 'Carisma',
}

const ABILITIES: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']

function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`
}

interface Props {
  scores: AbilityScores
  savingThrowProficiencies: [AbilityKey, AbilityKey]
  level: number
}

export function AbilityPanel({ scores, savingThrowProficiencies, level }: Props) {
  return (
    <div className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[var(--theme-text-mute)]">Caratteristiche</h3>
      <div className="grid grid-cols-3 gap-3">
        {ABILITIES.map((ability) => {
          const mod = abilityModifier(scores[ability])
          const isProficient = savingThrowProficiencies.includes(ability)
          const save = savingThrowBonus(scores, ability, level, isProficient)
          return (
            <div key={ability} className="rounded border border-[var(--theme-border)] bg-[var(--theme-bg-elev)] p-2 text-center">
              <div className="text-xs uppercase text-[var(--theme-text-mute)]">{ABILITY_LABELS[ability]}</div>
              <div className="text-xl font-bold text-[var(--theme-text)]">{scores[ability]}</div>
              <div className="text-sm text-[var(--theme-accent-bright)]">{formatModifier(mod)}</div>
              <div className="mt-1 text-xs text-[var(--theme-text-mute)]">
                TS {formatModifier(save)}
                {isProficient && ' •'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
