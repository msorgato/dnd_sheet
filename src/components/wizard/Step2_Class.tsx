import { CLASSES } from '../../data/classes'
import { useDataStore } from '../../store/dataStore'
import { resolveClass } from '../../utils/classLookup'
import { WizardLayout } from './WizardLayout'

interface Props {
  selectedClassId: string
  onSelect: (classId: string) => void
  onNext: () => void
  onBack: () => void
}

export function Step2_Class({ selectedClassId, onSelect, onNext, onBack }: Props) {
  const publishedCustomClasses = useDataStore((s) => s.publishedCustomClasses)
  const allClasses = [...CLASSES, ...publishedCustomClasses.map((c) => resolveClass(c.id)!)]
  const klass = resolveClass(selectedClassId)

  return (
    <WizardLayout step={2} title="Scegli la tua Classe" onBack={onBack} onNext={onNext} nextDisabled={!selectedClassId}>
      <div className="mb-6 grid grid-cols-2 gap-3">
        {allClasses.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className="rounded-lg border p-4 text-left transition"
            style={{
              borderColor: selectedClassId === c.id ? 'var(--theme-accent)' : 'var(--theme-border)',
              background: 'var(--theme-surface)',
            }}
          >
            <div className="mb-1 font-bold text-[var(--theme-accent-bright)]">{c.name}</div>
            <div className="text-xs text-[var(--theme-text-mute)]">
              Dado Vita d{c.hitDie}
              {publishedCustomClasses.some((pc) => pc.id === c.id) && ' · custom'}
            </div>
          </button>
        ))}
      </div>

      {klass && (
        <div className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5">
          <h2 className="mb-3 text-lg font-bold text-[var(--theme-accent-bright)]">{klass.name}</h2>
          <p className="mb-4 text-sm text-[var(--theme-text-soft)]">{klass.description}</p>
          <div className="space-y-1 text-sm text-[var(--theme-text-soft)]">
            <div>
              <strong className="text-[var(--theme-text)]">Competenze armatura:</strong>{' '}
              {klass.armorProficiencies.length ? klass.armorProficiencies.join(', ') : 'Nessuna'}
            </div>
            <div>
              <strong className="text-[var(--theme-text)]">Competenze armi:</strong> {klass.weaponProficiencies.join(', ')}
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text-mute)]">Funzionalità di 1° livello</h3>
            {klass.features
              .filter((f) => f.level === 1)
              .map((f) => (
                <div key={f.name} className="text-sm">
                  <span className="font-semibold text-[var(--theme-accent-bright)]">{f.name}: </span>
                  <span className="text-[var(--theme-text-soft)]">{f.description}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </WizardLayout>
  )
}
