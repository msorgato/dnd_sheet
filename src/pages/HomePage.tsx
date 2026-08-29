import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useCharacterStore } from '../store/characterStore'
import { useAuthStore } from '../store/authStore'
import { getSpecies } from '../data/species'
import { effectiveAbilityScores, maxHitPoints, armorClassUnarmored } from '../utils/calculations'
import { resolveClass } from '../utils/classLookup'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { ThemeSwitcher } from '../components/ui/ThemeSwitcher'
import type { Character } from '../types'

function CharacterCard({ char, onOpen, onDelete }: { char: Character; onOpen: () => void; onDelete: () => void }) {
  const species = getSpecies(char.speciesId)
  const scores = effectiveAbilityScores(char)
  const hp = maxHitPoints(char)
  const hpPct = hp > 0 ? Math.max(0, Math.min(100, (char.currentHp / hp) * 100)) : 0
  const ac = armorClassUnarmored(scores)
  const classLabel = char.classes
    .map((entry) => `${resolveClass(entry.classId)?.name ?? entry.classId} ${entry.level}`)
    .join(' / ')

  return (
    <div
      onClick={onOpen}
      className="cursor-pointer rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 transition hover:border-[var(--theme-accent)]"
    >
      <h3 className="text-xl font-semibold text-[var(--theme-text)]">{char.name || 'Senza nome'}</h3>
      <div className="mt-1 flex flex-wrap gap-x-2 text-xs uppercase tracking-wide text-[var(--theme-text-mute)]">
        <span>{species?.name ?? (char.speciesId || 'Specie non scelta')}</span>
        <span>·</span>
        <span>{classLabel || 'Classe non scelta'}</span>
        <span>·</span>
        <span className="text-[var(--theme-accent-bright)]">Liv. {char.totalLevel}</span>
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-xs text-[var(--theme-text-soft)]">
          <span>Punti Ferita</span>
          <span>
            {char.currentHp}/{hp}
          </span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-[var(--theme-bg-elev)]">
          <div className="h-2 rounded-full bg-[var(--theme-hp-high)]" style={{ width: `${hpPct}%` }} />
        </div>
      </div>

      <div className="mt-3 flex gap-2 text-center text-sm text-[var(--theme-text)]">
        <div className="flex-1 rounded border border-[var(--theme-border)] bg-[var(--theme-bg-elev)] py-1">
          CA {ac}
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          className="text-xs text-[var(--theme-danger)] hover:underline"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          Elimina
        </button>
      </div>
    </div>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const { characters, deleteCharacter, setActive } = useCharacterStore()
  const { signOut, isAdmin } = useAuthStore()
  const [pendingDelete, setPendingDelete] = useState<Character | null>(null)

  const openChar = (id: string) => {
    setActive(id)
    navigate(`/character/${id}`)
  }

  return (
    <div className="min-h-screen bg-[var(--theme-bg)]">
      <header className="flex items-center justify-between border-b border-[var(--theme-border)] px-6 py-4">
        <h1 className="text-lg font-semibold text-[var(--theme-text)]">dnd_sheet</h1>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <button className="text-sm text-[var(--theme-text-mute)] hover:text-[var(--theme-text)]" onClick={() => navigate('/lobbies')}>
            Lobby
          </button>
          {isAdmin && (
            <button className="text-sm text-[var(--theme-text-mute)] hover:text-[var(--theme-text)]" onClick={() => navigate('/admin')}>
              Admin
            </button>
          )}
          <button className="text-sm text-[var(--theme-text-mute)] hover:text-[var(--theme-text)]" onClick={() => navigate('/settings/account')}>
            Account
          </button>
          <button className="text-sm text-[var(--theme-text-mute)] hover:text-[var(--theme-text)]" onClick={signOut}>
            Esci
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[var(--theme-text)]">I tuoi personaggi</h2>
          <button
            className="rounded-md bg-[var(--theme-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--theme-accent-bright)]"
            onClick={() => navigate('/create')}
          >
            Crea personaggio
          </button>
        </div>

        {characters.length === 0 ? (
          <p className="text-center text-[var(--theme-text-mute)]">Nessun personaggio. Crea il tuo primo eroe.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {characters.map((char) => (
              <CharacterCard
                key={char.id}
                char={char}
                onOpen={() => openChar(char.id)}
                onDelete={() => setPendingDelete(char)}
              />
            ))}
          </div>
        )}
      </main>

      {pendingDelete && (
        <ConfirmModal
          title="Elimina personaggio"
          message={`Vuoi eliminare "${pendingDelete.name || 'questo personaggio'}"? L'azione non può essere annullata.`}
          confirmLabel="Elimina"
          danger
          onConfirm={() => {
            deleteCharacter(pendingDelete.id)
            setPendingDelete(null)
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}
