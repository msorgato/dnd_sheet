import { useState } from 'react'
import type { AbilityScores } from '../../types'
import { armorClassUnarmored, initiative, proficiencyBonus } from '../../utils/calculations'

interface Props {
  scores: AbilityScores
  level: number
  currentHp: number
  maxHp: number
  tempHp: number
  onDamage: (amount: number) => void
  onHeal: (amount: number) => void
  onSetTempHp: (amount: number) => void
  onFullRest: () => void
}

export function CombatStats({ scores, level, currentHp, maxHp, tempHp, onDamage, onHeal, onSetTempHp, onFullRest }: Props) {
  const [amount, setAmount] = useState(1)

  return (
    <div className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[var(--theme-text-mute)]">Statistiche di Combattimento</h3>

      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded border border-[var(--theme-border)] bg-[var(--theme-bg-elev)] p-2">
          <div className="text-xs text-[var(--theme-text-mute)]">CA</div>
          <div className="text-xl font-bold text-[var(--theme-text)]">{armorClassUnarmored(scores)}</div>
        </div>
        <div className="rounded border border-[var(--theme-border)] bg-[var(--theme-bg-elev)] p-2">
          <div className="text-xs text-[var(--theme-text-mute)]">Iniziativa</div>
          <div className="text-xl font-bold text-[var(--theme-text)]">
            {initiative(scores) >= 0 ? '+' : ''}
            {initiative(scores)}
          </div>
        </div>
        <div className="rounded border border-[var(--theme-border)] bg-[var(--theme-bg-elev)] p-2">
          <div className="text-xs text-[var(--theme-text-mute)]">Bonus Comp.</div>
          <div className="text-xl font-bold text-[var(--theme-text)]">+{proficiencyBonus(level)}</div>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm text-[var(--theme-text-soft)]">
          <span>Punti Ferita</span>
          <span>
            {currentHp}/{maxHp} {tempHp > 0 && `(+${tempHp} temp)`}
          </span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-[var(--theme-bg-elev)]">
          <div
            className="h-2 rounded-full bg-[var(--theme-hp-high)]"
            style={{ width: `${maxHp > 0 ? Math.max(0, Math.min(100, (currentHp / maxHp) * 100)) : 0}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="number"
          className="w-20 rounded border border-[var(--theme-border)] bg-[var(--theme-bg-elev)] px-2 py-1 text-[var(--theme-text)]"
          value={amount}
          min={0}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <button
          className="rounded-md border border-[var(--theme-danger)] px-3 py-1 text-sm text-[var(--theme-danger)]"
          onClick={() => onDamage(amount)}
        >
          Danno
        </button>
        <button
          className="rounded-md border border-[var(--theme-hp-high)] px-3 py-1 text-sm text-[var(--theme-hp-high)]"
          onClick={() => onHeal(amount)}
        >
          Cura
        </button>
        <button
          className="rounded-md border border-[var(--theme-border)] px-3 py-1 text-sm text-[var(--theme-text)]"
          onClick={() => onSetTempHp(amount)}
        >
          PF Temp.
        </button>
        <button
          className="rounded-md bg-[var(--theme-accent)] px-3 py-1 text-sm font-semibold text-white"
          onClick={onFullRest}
        >
          Riposo Lungo
        </button>
      </div>
    </div>
  )
}
