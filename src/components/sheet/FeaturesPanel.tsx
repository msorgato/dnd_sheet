import { getSpecies } from '../../data/species'
import { useDataStore } from '../../store/dataStore'
import { resolveClass } from '../../utils/classLookup'
import type { CharacterClassEntry } from '../../types'

interface Props {
  classes: CharacterClassEntry[]
  speciesId: string
  featIds: string[]
}

export function FeaturesPanel({ classes, speciesId, featIds }: Props) {
  const species = getSpecies(speciesId)
  const builtinFeats = useDataStore((s) => s.builtinFeats)

  return (
    <div className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[var(--theme-text-mute)]">Funzionalità</h3>

      {classes.map((entry) => {
        const klass = resolveClass(entry.classId)
        if (!klass) return null
        const features = klass.features.filter((f) => f.level <= entry.level)
        return (
          <div key={entry.classId} className="mb-3">
            <div className="mb-1 text-xs font-semibold uppercase text-[var(--theme-accent-bright)]">
              {klass.name} (liv. {entry.level})
            </div>
            {features.map((f) => (
              <div key={f.name} className="text-sm">
                <span className="font-semibold text-[var(--theme-text)]">{f.name}: </span>
                <span className="text-[var(--theme-text-soft)]">{f.description}</span>
              </div>
            ))}
          </div>
        )
      })}

      {species && species.traits.length > 0 && (
        <div className="mb-3">
          <div className="mb-1 text-xs font-semibold uppercase text-[var(--theme-accent-bright)]">{species.name}</div>
          {species.traits.map((t) => (
            <div key={t.name} className="text-sm">
              <span className="font-semibold text-[var(--theme-text)]">{t.name}: </span>
              <span className="text-[var(--theme-text-soft)]">{t.description}</span>
            </div>
          ))}
        </div>
      )}

      {featIds.length > 0 && (
        <div>
          <div className="mb-1 text-xs font-semibold uppercase text-[var(--theme-accent-bright)]">Talenti</div>
          {featIds.map((featId) => {
            const feat = builtinFeats.find((f) => f.id === featId)
            return (
              <div key={featId} className="text-sm">
                <span className="font-semibold text-[var(--theme-text)]">{feat?.name ?? featId}: </span>
                <span className="text-[var(--theme-text-soft)]">{feat?.benefit ?? ''}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
