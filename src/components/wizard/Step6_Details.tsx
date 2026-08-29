import { getSpecies } from '../../data/species'
import { getBackground } from '../../data/backgrounds'
import { resolveClass } from '../../utils/classLookup'
import { WizardLayout } from './WizardLayout'

interface Props {
  name: string
  speciesId: string
  classId: string
  backgroundId: string
  onNameChange: (name: string) => void
  onFinish: () => void
  onBack: () => void
}

export function Step6_Details({ name, speciesId, classId, backgroundId, onNameChange, onFinish, onBack }: Props) {
  const species = getSpecies(speciesId)
  const klass = resolveClass(classId)
  const background = getBackground(backgroundId)

  return (
    <WizardLayout step={6} title="Dettagli finali" onBack={onBack} onNext={onFinish} nextLabel="Crea personaggio" nextDisabled={!name.trim()}>
      <div className="mb-6 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5">
        <label className="mb-2 block text-sm font-semibold text-[var(--theme-text)]">Nome del personaggio</label>
        <input
          className="w-full rounded border border-[var(--theme-border)] bg-[var(--theme-bg-elev)] px-3 py-2 text-[var(--theme-text)]"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Es. Aldric Tempestalama"
        />
      </div>

      <div className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[var(--theme-text-mute)]">Riepilogo</h3>
        <ul className="space-y-1 text-sm text-[var(--theme-text-soft)]">
          <li>
            <strong className="text-[var(--theme-text)]">Specie:</strong> {species?.name ?? '—'}
          </li>
          <li>
            <strong className="text-[var(--theme-text)]">Classe:</strong> {klass?.name ?? '—'}
          </li>
          <li>
            <strong className="text-[var(--theme-text)]">Background:</strong> {background?.name ?? '—'}
          </li>
          <li>
            <strong className="text-[var(--theme-text)]">Equipaggiamento iniziale:</strong>{' '}
            {background?.equipment.join(', ') ?? '—'}
          </li>
        </ul>
      </div>
    </WizardLayout>
  )
}
