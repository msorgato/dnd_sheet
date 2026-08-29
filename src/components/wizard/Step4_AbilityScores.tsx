import { useState } from 'react'
import type { AbilityKey, AbilityScores } from '../../types'
import { WizardLayout } from './WizardLayout'

const ABILITY_LABELS: Record<AbilityKey, string> = {
  str: 'Forza',
  dex: 'Destrezza',
  con: 'Costituzione',
  int: 'Intelligenza',
  wis: 'Saggezza',
  cha: 'Carisma',
}

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8]
const ABILITIES: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']

interface Props {
  scores: AbilityScores
  onChange: (scores: AbilityScores) => void
  onNext: () => void
  onBack: () => void
}

/** Valori della serie standard non ancora assegnati ad alcuna caratteristica diversa da `except`. */
function availableValuesFor(assignment: AbilityScores, except: AbilityKey): number[] {
  const usedElsewhere = ABILITIES.filter((a) => a !== except).map((a) => assignment[a])
  const pool = [...STANDARD_ARRAY]
  for (const value of usedElsewhere) {
    const idx = pool.indexOf(value)
    if (idx !== -1) pool.splice(idx, 1)
  }
  return pool
}

function isFullyAssigned(assignment: AbilityScores): boolean {
  const remaining = [...STANDARD_ARRAY]
  for (const ability of ABILITIES) {
    const idx = remaining.indexOf(assignment[ability])
    if (idx === -1) return false
    remaining.splice(idx, 1)
  }
  return true
}

export function Step4_AbilityScores({ scores, onChange, onNext, onBack }: Props) {
  const [assignment, setAssignment] = useState<AbilityScores>(scores)

  const canProceed = isFullyAssigned(assignment)

  const assign = (ability: AbilityKey, value: number) => {
    const next = { ...assignment, [ability]: value }
    setAssignment(next)
    onChange(next)
  }

  return (
    <WizardLayout step={4} title="Assegna i Punteggi di Caratteristica" onBack={onBack} onNext={onNext} nextDisabled={!canProceed}>
      <p className="mb-4 text-sm text-[var(--theme-text-soft)]">
        Assegna la serie standard (15, 14, 13, 12, 10, 8) alle sei caratteristiche, un valore ciascuna.
      </p>
      <div className="space-y-3">
        {ABILITIES.map((ability) => {
          const currentValue = assignment[ability]
          const options = availableValuesFor(assignment, ability)
          if (currentValue && !options.includes(currentValue)) options.push(currentValue)
          options.sort((a, b) => b - a)
          return (
            <div
              key={ability}
              className="flex items-center justify-between rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3"
            >
              <span className="text-[var(--theme-text)]">{ABILITY_LABELS[ability]}</span>
              <select
                className="rounded border border-[var(--theme-border)] bg-[var(--theme-bg-elev)] px-2 py-1 text-[var(--theme-text)]"
                value={currentValue}
                onChange={(e) => assign(ability, Number(e.target.value))}
              >
                <option value={0}>—</option>
                {options.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          )
        })}
      </div>
    </WizardLayout>
  )
}
