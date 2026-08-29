import { useState } from 'react'
import { resolveClass } from '../../utils/classLookup'
import type { CharacterClassEntry } from '../../types'
import { proficiencyBonus } from '../../utils/calculations'

interface Props {
  classes: CharacterClassEntry[]
  currentLevel: number
  onConfirm: (classId: string, hpRoll: number) => void
  onCancel: () => void
}

function averageHitPoints(hitDie: number): number {
  return Math.ceil(hitDie / 2) + 1
}

export function LevelUpWizard({ classes, currentLevel, onConfirm, onCancel }: Props) {
  const [classId, setClassId] = useState(classes[0]?.classId ?? '')
  const klass = resolveClass(classId)
  const [hpRoll, setHpRoll] = useState(klass ? averageHitPoints(klass.hitDie) : 1)

  const newLevel = currentLevel + 1
  const bonusIncreases = proficiencyBonus(newLevel) > proficiencyBonus(currentLevel)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="w-full max-w-sm rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6">
        <h3 className="mb-4 text-lg font-bold text-[var(--theme-accent-bright)]">Livello {newLevel}</h3>

        <label className="mb-1 block text-sm text-[var(--theme-text)]">Classe</label>
        <select
          className="mb-4 w-full rounded border border-[var(--theme-border)] bg-[var(--theme-bg-elev)] px-2 py-1 text-[var(--theme-text)]"
          value={classId}
          onChange={(e) => {
            setClassId(e.target.value)
            const cls = resolveClass(e.target.value)
            if (cls) setHpRoll(averageHitPoints(cls.hitDie))
          }}
        >
          {classes.map((entry) => {
            const cls = resolveClass(entry.classId)
            return (
              <option key={entry.classId} value={entry.classId}>
                {cls?.name ?? entry.classId} (liv. {entry.level})
              </option>
            )
          })}
        </select>

        <label className="mb-1 block text-sm text-[var(--theme-text)]">
          Punti ferita guadagnati (d{klass?.hitDie ?? 6}, media {klass ? averageHitPoints(klass.hitDie) : '—'})
        </label>
        <input
          type="number"
          className="mb-4 w-full rounded border border-[var(--theme-border)] bg-[var(--theme-bg-elev)] px-2 py-1 text-[var(--theme-text)]"
          value={hpRoll}
          min={1}
          onChange={(e) => setHpRoll(Number(e.target.value))}
        />

        {bonusIncreases && (
          <p className="mb-4 text-sm text-[var(--theme-accent-bright)]">
            Il bonus di competenza aumenta a +{proficiencyBonus(newLevel)} a questo livello.
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button className="rounded-md px-4 py-2 text-sm text-[var(--theme-text-mute)]" onClick={onCancel}>
            Annulla
          </button>
          <button
            className="rounded-md bg-[var(--theme-accent)] px-4 py-2 text-sm font-semibold text-white"
            onClick={() => onConfirm(classId, hpRoll)}
            disabled={!classId}
          >
            Conferma
          </button>
        </div>
      </div>
    </div>
  )
}
