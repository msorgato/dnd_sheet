import { useDataStore } from '../../store/dataStore'
import { resolveClass } from '../../utils/classLookup'
import type { CharacterClassEntry, PreparedSpell, SpellSlotUsage } from '../../types'

interface Props {
  classes: CharacterClassEntry[]
  preparedSpells: PreparedSpell[]
  spellSlots: SpellSlotUsage[]
  onUseSlot: (classId: string, spellLevel: number) => void
}

export function SpellsPanel({ classes, preparedSpells, spellSlots, onUseSlot }: Props) {
  const builtinSpells = useDataStore((s) => s.builtinSpells)

  const casters = classes
    .map((entry) => ({ entry, klass: resolveClass(entry.classId) }))
    .filter((c) => c.klass?.spellcasting)

  if (casters.length === 0) return null

  return (
    <div className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[var(--theme-text-mute)]">Incantesimi</h3>

      {casters.map(({ entry, klass }) => {
        if (!klass?.spellcasting) return null
        const slotsForLevel = klass.spellcasting.slotsByCharacterLevel[entry.level - 1] ?? []
        const preparedForClass = preparedSpells.filter((sp) => sp.classId === entry.classId)

        return (
          <div key={entry.classId} className="mb-4">
            <div className="mb-2 text-xs font-semibold uppercase text-[var(--theme-accent-bright)]">{klass.name}</div>

            <div className="mb-2 flex flex-wrap gap-2">
              {slotsForLevel.map((total, idx) => {
                const spellLevel = idx + 1
                const usage = spellSlots.find((ss) => ss.classId === entry.classId && ss.spellLevel === spellLevel)
                const used = usage?.used ?? 0
                return (
                  <button
                    key={spellLevel}
                    disabled={used >= total}
                    onClick={() => onUseSlot(entry.classId, spellLevel)}
                    className="rounded border border-[var(--theme-border)] bg-[var(--theme-bg-elev)] px-2 py-1 text-xs text-[var(--theme-text)] disabled:opacity-40"
                  >
                    Liv. {spellLevel}: {total - used}/{total}
                  </button>
                )
              })}
            </div>

            <div className="space-y-1">
              {preparedForClass.map((sp) => {
                const spell = builtinSpells.find((s) => s.id === sp.spellId)
                return (
                  <div key={sp.spellId} className="text-sm text-[var(--theme-text-soft)]">
                    {spell?.name ?? sp.spellId}{' '}
                    <span className="text-[var(--theme-text-mute)]">
                      ({spell?.level === 0 ? 'trucchetto' : `liv. ${spell?.level}`})
                    </span>
                  </div>
                )
              })}
              {preparedForClass.length === 0 && (
                <div className="text-sm text-[var(--theme-text-mute)]">Nessun incantesimo preparato.</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
