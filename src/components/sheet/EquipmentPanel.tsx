import type { EquipmentItem } from '../../types'

interface Props {
  equipment: EquipmentItem[]
}

export function EquipmentPanel({ equipment }: Props) {
  return (
    <div className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[var(--theme-text-mute)]">Equipaggiamento</h3>
      {equipment.length === 0 ? (
        <p className="text-sm text-[var(--theme-text-mute)]">Nessun oggetto.</p>
      ) : (
        <ul className="space-y-1 text-sm text-[var(--theme-text-soft)]">
          {equipment.map((item) => (
            <li key={item.id}>
              {item.name} {item.quantity > 1 && `× ${item.quantity}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
