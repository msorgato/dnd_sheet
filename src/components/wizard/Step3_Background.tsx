import { useState } from 'react'
import { BACKGROUNDS } from '../../data/backgrounds'
import type { AbilityKey } from '../../types'
import { WizardLayout } from './WizardLayout'

const ABILITY_LABELS: Record<AbilityKey, string> = {
  str: 'FOR',
  dex: 'DES',
  con: 'COS',
  int: 'INT',
  wis: 'SAG',
  cha: 'CAR',
}

interface Props {
  selectedBackgroundId: string
  abilityBonus: Partial<Record<AbilityKey, number>>
  onSelect: (backgroundId: string, bonus: Partial<Record<AbilityKey, number>>) => void
  onNext: () => void
  onBack: () => void
}

export function Step3_Background({ selectedBackgroundId, abilityBonus, onSelect, onNext, onBack }: Props) {
  const [backgroundId, setBackgroundId] = useState(selectedBackgroundId)
  const [bonus, setBonus] = useState<Partial<Record<AbilityKey, number>>>(abilityBonus)

  const background = BACKGROUNDS.find((b) => b.id === backgroundId)
  const totalBonus = Object.values(bonus).reduce((sum, v) => sum + (v ?? 0), 0)
  const canProceed = !!backgroundId && totalBonus === 3

  const handleSelect = (id: string) => {
    setBackgroundId(id)
    setBonus({})
  }

  const toggleAbility = (ability: AbilityKey) => {
    if (!background) return
    const current = bonus[ability] ?? 0
    if (current === 2) {
      setBonus((b) => ({ ...b, [ability]: 0 }))
      return
    }
    const hasTwo = Object.values(bonus).some((v) => v === 2)
    setBonus((b) => ({ ...b, [ability]: !hasTwo ? 2 : 1 }))
  }

  const handleCommit = () => {
    onSelect(backgroundId, bonus)
    onNext()
  }

  return (
    <WizardLayout step={3} title="Scegli il tuo Background" onBack={onBack} onNext={handleCommit} nextDisabled={!canProceed}>
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {BACKGROUNDS.map((b) => (
          <button
            key={b.id}
            onClick={() => handleSelect(b.id)}
            className="rounded-lg border p-4 text-left transition"
            style={{
              borderColor: backgroundId === b.id ? 'var(--theme-accent)' : 'var(--theme-border)',
              background: 'var(--theme-surface)',
            }}
          >
            <div className="mb-1 font-bold text-[var(--theme-accent-bright)]">{b.name}</div>
            <div className="text-xs text-[var(--theme-text-mute)]">{b.abilityScoreOptions.map((a) => ABILITY_LABELS[a]).join(' / ')}</div>
          </button>
        ))}
      </div>

      {background && (
        <div className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5">
          <h2 className="mb-3 text-lg font-bold text-[var(--theme-accent-bright)]">{background.name}</h2>
          <p className="mb-4 text-sm text-[var(--theme-text-soft)]">{background.description}</p>

          <div className="mb-4 rounded border border-[var(--theme-border)] bg-[var(--theme-bg-elev)] p-3">
            <p className="mb-2 text-sm font-semibold text-[var(--theme-accent-bright)]">
              Distribuisci +2/+1 tra: {background.abilityScoreOptions.map((a) => ABILITY_LABELS[a]).join(', ')}
            </p>
            <div className="flex flex-wrap gap-2">
              {background.abilityScoreOptions.map((ability) => {
                const value = bonus[ability] ?? 0
                return (
                  <button
                    key={ability}
                    onClick={() => toggleAbility(ability)}
                    className="rounded-md px-3 py-1 text-sm"
                    style={{
                      background: value > 0 ? 'var(--theme-accent)' : 'var(--theme-bg-elev)',
                      color: value > 0 ? 'white' : 'var(--theme-text)',
                      border: `1px solid ${value > 0 ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
                    }}
                  >
                    {ABILITY_LABELS[ability]} {value > 0 ? `+${value}` : ''}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-1 text-sm text-[var(--theme-text-soft)]">
            <div>
              <strong className="text-[var(--theme-text)]">Competenze:</strong> {background.skillProficiencies.join(', ')}
            </div>
            <div>
              <strong className="text-[var(--theme-text)]">Talento di origine:</strong> {background.originFeatId}
            </div>
          </div>
        </div>
      )}
    </WizardLayout>
  )
}
