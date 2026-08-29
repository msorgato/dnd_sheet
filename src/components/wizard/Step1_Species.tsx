import { SPECIES } from '../../data/species'
import { WizardLayout } from './WizardLayout'

interface Props {
  selectedSpeciesId: string
  onSelect: (speciesId: string) => void
  onNext: () => void
}

export function Step1_Species({ selectedSpeciesId, onSelect, onNext }: Props) {
  const species = SPECIES.find((s) => s.id === selectedSpeciesId)

  return (
    <WizardLayout step={1} title="Scegli la tua Specie" onNext={onNext} nextDisabled={!selectedSpeciesId}>
      <div className="mb-6 grid grid-cols-2 gap-3">
        {SPECIES.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className="rounded-lg border p-4 text-left transition"
            style={{
              borderColor: selectedSpeciesId === s.id ? 'var(--theme-accent)' : 'var(--theme-border)',
              background: 'var(--theme-surface)',
            }}
          >
            <div className="mb-1 font-bold text-[var(--theme-accent-bright)]">{s.name}</div>
            <div className="text-xs text-[var(--theme-text-mute)]">
              {s.size} · {s.speed} m
            </div>
          </button>
        ))}
      </div>

      {species && (
        <div className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5">
          <h2 className="mb-3 text-lg font-bold text-[var(--theme-accent-bright)]">{species.name}</h2>
          <p className="mb-4 text-sm text-[var(--theme-text-soft)]">{species.description}</p>
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-text-mute)]">Tratti</h3>
            {species.traits.map((t) => (
              <div key={t.name} className="text-sm">
                <span className="font-semibold text-[var(--theme-accent-bright)]">{t.name}: </span>
                <span className="text-[var(--theme-text-soft)]">{t.description}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-[var(--theme-text-mute)]">
            <strong>Lingue:</strong> {species.languages.join(', ')}
          </div>
        </div>
      )}
    </WizardLayout>
  )
}
