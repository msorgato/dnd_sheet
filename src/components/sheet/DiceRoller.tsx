import { useState, useRef, useEffect } from 'react'
import type { RollResultData } from '../../types'

interface RollResult {
  id: string
  label: string
  dice: number[]
  dieType: number
  modifier: number
  total: number
}

interface Props {
  characterName?: string
  onRollResult?: (result: RollResultData) => void
}

const DICE = [4, 6, 8, 10, 12, 20, 100]

function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1
}

function isCrit(dice: number[], dieType: number): boolean {
  return dieType === 20 && dice.length === 1 && dice[0] === 20
}

function isFumble(dice: number[], dieType: number): boolean {
  return dieType === 20 && dice.length === 1 && dice[0] === 1
}

function modStr(v: number): string {
  return v === 0 ? '' : v > 0 ? `+${v}` : `${v}`
}

export function DiceRoller({ characterName = '', onRollResult }: Props) {
  const [numDice, setNumDice] = useState(1)
  const [dieType, setDieType] = useState(20)
  const [modifier, setModifier] = useState(0)
  const [results, setResults] = useState<RollResult[]>([])
  const onRollResultRef = useRef(onRollResult)
  useEffect(() => {
    onRollResultRef.current = onRollResult
  }, [onRollResult])

  const performRoll = (label: string, n: number, d: number, mod: number) => {
    const dice = Array.from({ length: n }, () => rollDie(d))
    const total = dice.reduce((a, b) => a + b, 0) + mod
    const id = Date.now().toString()
    setResults((prev) => [{ id, label, dice, dieType: d, modifier: mod, total }, ...prev].slice(0, 30))
    onRollResultRef.current?.({
      characterName,
      label,
      formula: `${n}d${d}${modStr(mod)}`,
      rolls: dice,
      modifier: mod,
      total,
      isCrit: isCrit(dice, d),
      isFumble: isFumble(dice, d),
    })
  }

  const latest = results[0]
  const crit = latest && isCrit(latest.dice, latest.dieType)
  const fumble = latest && isFumble(latest.dice, latest.dieType)

  return (
    <div className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
      <h3 className="mb-2 text-sm font-bold text-[var(--theme-accent-bright)]">Lancia i Dadi</h3>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {DICE.map((d) => (
          <button
            key={d}
            onClick={() => setDieType(d)}
            className="rounded px-2.5 py-1 text-xs font-bold"
            style={{
              background: dieType === d ? 'var(--theme-accent)' : 'var(--theme-bg-elev)',
              color: dieType === d ? 'white' : 'var(--theme-text-soft)',
              border: `1px solid ${dieType === d ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
            }}
          >
            d{d}
          </button>
        ))}
      </div>

      <div className="mb-3 flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setNumDice((n) => Math.max(1, n - 1))}
            className="flex h-6 w-6 items-center justify-center rounded border border-[var(--theme-border)] bg-[var(--theme-bg-elev)] text-sm font-bold text-[var(--theme-text-soft)]"
          >
            −
          </button>
          <span className="w-7 text-center text-sm font-bold text-[var(--theme-text)]">{numDice}</span>
          <button
            onClick={() => setNumDice((n) => Math.min(20, n + 1))}
            className="flex h-6 w-6 items-center justify-center rounded border border-[var(--theme-border)] bg-[var(--theme-bg-elev)] text-sm font-bold text-[var(--theme-text-soft)]"
          >
            +
          </button>
          <span className="ml-1 text-xs text-[var(--theme-text-mute)]">×d{dieType}</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-xs text-[var(--theme-text-mute)]">mod</span>
          <input
            type="number"
            className="w-14 rounded border border-[var(--theme-border)] bg-[var(--theme-bg-elev)] px-1 py-0.5 text-center text-sm text-[var(--theme-text)]"
            value={modifier}
            onChange={(e) => setModifier(Number(e.target.value))}
          />
        </div>
      </div>

      <button
        className="w-full rounded py-2 text-base font-bold text-white"
        style={{ background: 'var(--theme-accent)' }}
        onClick={() => performRoll(`${numDice}d${dieType}`, numDice, dieType, modifier)}
      >
        Lancia!
      </button>

      {latest && (
        <div
          className="mt-3 rounded-lg p-3 text-center"
          style={{
            background: crit ? 'rgba(74,222,128,0.1)' : fumble ? 'rgba(239,68,68,0.1)' : 'var(--theme-bg-elev)',
            border: `1px solid ${crit ? 'var(--theme-hp-high)' : fumble ? 'var(--theme-danger)' : 'var(--theme-border)'}`,
          }}
        >
          <div
            className="text-4xl font-bold"
            style={{ color: crit ? 'var(--theme-hp-high)' : fumble ? 'var(--theme-danger)' : 'var(--theme-accent-bright)' }}
          >
            {latest.total}
          </div>
          {crit && <div className="mt-0.5 text-xs font-bold text-[var(--theme-hp-high)]">CRITICO!</div>}
          {fumble && <div className="mt-0.5 text-xs font-bold text-[var(--theme-danger)]">FALLIMENTO CRITICO!</div>}
          <div className="mt-1 text-xs text-[var(--theme-text-mute)]">
            [{latest.dice.join(', ')}]{modStr(latest.modifier) ? ` ${modStr(latest.modifier)}` : ''}
          </div>
        </div>
      )}
    </div>
  )
}
