import { useState } from 'react'
import type { AbilityKey, ClassFeature, CustomClassDefinition } from '../../types'

interface Props {
  cls: CustomClassDefinition
  onSave: (updated: CustomClassDefinition) => void
  onDelete: () => void
  onPublish: () => void
  onWithdraw: () => void
}

const HIT_DICE = [6, 8, 10, 12] as const
const ABILITY_LABELS: Record<AbilityKey, string> = {
  str: 'Forza',
  dex: 'Destrezza',
  con: 'Costituzione',
  int: 'Intelligenza',
  wis: 'Saggezza',
  cha: 'Carisma',
}
const ABILITIES: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="mb-1 block text-xs font-semibold text-[var(--theme-text-mute)]">{label}</label>
      {children}
    </div>
  )
}

export function CustomClassEditor({ cls, onSave, onDelete, onPublish, onWithdraw }: Props) {
  const [draft, setDraft] = useState<CustomClassDefinition>({ ...cls, featuresByLevel: { ...cls.featuresByLevel } })
  const [newFeatureLevel, setNewFeatureLevel] = useState(1)
  const [newFeatureName, setNewFeatureName] = useState('')
  const [newFeatureDescription, setNewFeatureDescription] = useState('')

  const set = <K extends keyof CustomClassDefinition>(key: K, value: CustomClassDefinition[K]) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const dirty = JSON.stringify(draft) !== JSON.stringify(cls)

  const setSavingThrow = (index: 0 | 1, ability: AbilityKey) => {
    const next = [...draft.savingThrowProficiencies] as [AbilityKey, AbilityKey]
    next[index] = ability
    set('savingThrowProficiencies', next)
  }

  const addFeature = () => {
    if (!newFeatureName.trim()) return
    const feature: ClassFeature = { level: newFeatureLevel, name: newFeatureName.trim(), description: newFeatureDescription.trim() }
    const existing = draft.featuresByLevel[newFeatureLevel] ?? []
    setDraft((d) => ({ ...d, featuresByLevel: { ...d.featuresByLevel, [newFeatureLevel]: [...existing, feature] } }))
    setNewFeatureName('')
    setNewFeatureDescription('')
  }

  const removeFeature = (level: number, index: number) => {
    setDraft((d) => ({
      ...d,
      featuresByLevel: { ...d.featuresByLevel, [level]: (d.featuresByLevel[level] ?? []).filter((_, i) => i !== index) },
    }))
  }

  const sortedLevels = Object.keys(draft.featuresByLevel)
    .map(Number)
    .sort((a, b) => a - b)

  return (
    <div>
      <Field label="Nome">
        <input
          className="w-full rounded border border-[var(--theme-border)] bg-[var(--theme-bg-elev)] px-2 py-1 text-[var(--theme-text)]"
          value={draft.name}
          onChange={(e) => set('name', e.target.value)}
        />
      </Field>
      <Field label="Descrizione">
        <textarea
          className="w-full rounded border border-[var(--theme-border)] bg-[var(--theme-bg-elev)] px-2 py-1 text-[var(--theme-text)]"
          rows={3}
          value={draft.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </Field>
      <Field label="Dado Vita">
        <select
          className="rounded border border-[var(--theme-border)] bg-[var(--theme-bg-elev)] px-2 py-1 text-[var(--theme-text)]"
          value={draft.hitDie}
          onChange={(e) => set('hitDie', Number(e.target.value) as CustomClassDefinition['hitDie'])}
        >
          {HIT_DICE.map((d) => (
            <option key={d} value={d}>
              d{d}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Competenze su tiri salvezza (2 caratteristiche)">
        <div className="flex gap-2">
          <select
            className="rounded border border-[var(--theme-border)] bg-[var(--theme-bg-elev)] px-2 py-1 text-[var(--theme-text)]"
            value={draft.savingThrowProficiencies[0]}
            onChange={(e) => setSavingThrow(0, e.target.value as AbilityKey)}
          >
            {ABILITIES.map((a) => (
              <option key={a} value={a}>
                {ABILITY_LABELS[a]}
              </option>
            ))}
          </select>
          <select
            className="rounded border border-[var(--theme-border)] bg-[var(--theme-bg-elev)] px-2 py-1 text-[var(--theme-text)]"
            value={draft.savingThrowProficiencies[1]}
            onChange={(e) => setSavingThrow(1, e.target.value as AbilityKey)}
          >
            {ABILITIES.map((a) => (
              <option key={a} value={a}>
                {ABILITY_LABELS[a]}
              </option>
            ))}
          </select>
        </div>
      </Field>
      <Field label="Competenze armatura (separate da virgola)">
        <input
          className="w-full rounded border border-[var(--theme-border)] bg-[var(--theme-bg-elev)] px-2 py-1 text-[var(--theme-text)]"
          value={draft.armorProficiencies.join(', ')}
          onChange={(e) => set('armorProficiencies', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
        />
      </Field>
      <Field label="Competenze armi (separate da virgola)">
        <input
          className="w-full rounded border border-[var(--theme-border)] bg-[var(--theme-bg-elev)] px-2 py-1 text-[var(--theme-text)]"
          value={draft.weaponProficiencies.join(', ')}
          onChange={(e) => set('weaponProficiencies', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
        />
      </Field>

      <div className="mb-3">
        <label className="mb-1 block text-xs font-semibold text-[var(--theme-text-mute)]">Funzionalità per livello</label>
        {sortedLevels.length === 0 && <p className="text-sm text-[var(--theme-text-mute)]">Nessuna funzionalità definita.</p>}
        {sortedLevels.map((level) => (
          <div key={level} className="mb-2">
            <div className="text-xs font-semibold text-[var(--theme-accent-bright)]">Livello {level}</div>
            {(draft.featuresByLevel[level] ?? []).map((feature, index) => (
              <div key={`${feature.name}-${index}`} className="flex items-start justify-between gap-2 text-sm text-[var(--theme-text-soft)]">
                <span>
                  <strong className="text-[var(--theme-text)]">{feature.name}:</strong> {feature.description}
                </span>
                <button className="shrink-0 text-xs text-[var(--theme-danger)]" onClick={() => removeFeature(level, index)}>
                  Rimuovi
                </button>
              </div>
            ))}
          </div>
        ))}

        <div className="mt-2 flex flex-wrap items-end gap-2 rounded border border-[var(--theme-border)] bg-[var(--theme-bg-elev)] p-2">
          <div>
            <label className="mb-1 block text-xs text-[var(--theme-text-mute)]">Livello</label>
            <input
              type="number"
              min={1}
              max={20}
              className="w-16 rounded border border-[var(--theme-border)] bg-[var(--theme-surface)] px-2 py-1 text-[var(--theme-text)]"
              value={newFeatureLevel}
              onChange={(e) => setNewFeatureLevel(Number(e.target.value))}
            />
          </div>
          <input
            className="flex-1 rounded border border-[var(--theme-border)] bg-[var(--theme-surface)] px-2 py-1 text-[var(--theme-text)]"
            placeholder="Nome funzionalità"
            value={newFeatureName}
            onChange={(e) => setNewFeatureName(e.target.value)}
          />
          <input
            className="flex-[2] rounded border border-[var(--theme-border)] bg-[var(--theme-surface)] px-2 py-1 text-[var(--theme-text)]"
            placeholder="Descrizione"
            value={newFeatureDescription}
            onChange={(e) => setNewFeatureDescription(e.target.value)}
          />
          <button className="rounded border border-[var(--theme-border)] px-3 py-1 text-sm text-[var(--theme-text)]" onClick={addFeature}>
            + Aggiungi
          </button>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {dirty && (
          <button className="rounded-md bg-[var(--theme-accent)] px-4 py-1.5 text-xs font-semibold text-white" onClick={() => onSave(draft)}>
            Salva
          </button>
        )}
        {draft.status === 'draft' ? (
          <button className="rounded border border-[var(--theme-accent)] px-3 py-1.5 text-xs text-[var(--theme-accent-bright)]" onClick={onPublish}>
            Pubblica
          </button>
        ) : (
          <button className="rounded border border-[var(--theme-border)] px-3 py-1.5 text-xs text-[var(--theme-text)]" onClick={onWithdraw}>
            Ritira dalla libreria
          </button>
        )}
        <button className="ml-auto rounded border border-[var(--theme-danger)] px-3 py-1.5 text-xs text-[var(--theme-danger)]" onClick={onDelete}>
          Elimina
        </button>
      </div>
    </div>
  )
}
