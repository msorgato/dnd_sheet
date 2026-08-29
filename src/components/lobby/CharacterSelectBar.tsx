import { useState } from 'react'
import type { Character } from '../../types'

interface Props {
  characters: Character[]
  activeCharacterId: string | null
  onSelect: (charId: string | null) => void
}

export function CharacterSelectBar({ characters, activeCharacterId, onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const active = characters.find((c) => c.id === activeCharacterId)

  return (
    <div className="relative">
      <button
        className="flex w-full items-center gap-2 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-bg-elev)] px-3 py-1.5 text-sm"
        style={{ color: active ? 'var(--theme-text)' : 'var(--theme-text-mute)' }}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="flex-1 truncate text-left">{active ? active.name : 'Scegli personaggio…'}</span>
        <span className="text-[10px] text-[var(--theme-text-mute)]">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] shadow-xl">
          {characters.length === 0 && <div className="px-3 py-2 text-xs text-[var(--theme-text-mute)]">Nessun personaggio disponibile.</div>}
          {characters.map((c) => (
            <button
              key={c.id}
              className="flex w-full items-center gap-2 border-b border-[var(--theme-bg)] px-3 py-2 text-left text-sm"
              style={{
                background: c.id === activeCharacterId ? 'rgba(220,38,38,0.12)' : 'transparent',
                color: c.id === activeCharacterId ? 'var(--theme-accent-bright)' : 'var(--theme-text)',
              }}
              onClick={() => {
                onSelect(c.id)
                setOpen(false)
              }}
            >
              <span className="flex-1 truncate font-medium">{c.name || '(senza nome)'}</span>
              {c.id === activeCharacterId && <span className="text-xs text-[var(--theme-accent-bright)]">✓</span>}
            </button>
          ))}
          {activeCharacterId && (
            <button
              className="w-full border-t border-[var(--theme-border)] px-3 py-2 text-left text-xs text-[var(--theme-text-mute)]"
              onClick={() => {
                onSelect(null)
                setOpen(false)
              }}
            >
              Rimuovi personaggio
            </button>
          )}
        </div>
      )}
    </div>
  )
}
