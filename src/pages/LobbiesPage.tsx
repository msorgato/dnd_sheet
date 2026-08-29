import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useLobbyStore } from '../store/lobbyStore'
import { CreateLobbyModal } from '../components/lobby/CreateLobbyModal'
import { JoinLobbyModal } from '../components/lobby/JoinLobbyModal'
import type { LobbyWithUnread } from '../types'

export function LobbiesPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { lobbies, loading, error, loadUserLobbies, createLobby, joinLobby, openLobby, clearError } = useLobbyStore()
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)

  const uid = user?.uid ?? ''
  const displayName = user?.displayName ?? user?.email ?? 'Utente'

  useEffect(() => {
    if (uid) loadUserLobbies(uid)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid])

  const handleCreate = async (name: string) => {
    const lobby = await createLobby(uid, displayName, name)
    setShowCreate(false)
    openLobby(uid, lobby)
    navigate(`/lobbies/${lobby.id}`)
  }

  const handleJoin = async (code: string) => {
    const lobby = await joinLobby(uid, displayName, code)
    setShowJoin(false)
    openLobby(uid, lobby)
    navigate(`/lobbies/${lobby.id}`)
  }

  const openExisting = (lobby: LobbyWithUnread) => {
    openLobby(uid, lobby)
    navigate(`/lobbies/${lobby.id}`)
  }

  return (
    <div className="min-h-screen bg-[var(--theme-bg)]">
      <header className="border-b border-[var(--theme-border)] px-6 py-6 text-center">
        <button
          className="absolute left-4 top-4 text-sm text-[var(--theme-text-mute)] hover:text-[var(--theme-text)]"
          onClick={() => navigate('/')}
        >
          ← Home
        </button>
        <h1 className="text-2xl font-bold text-[var(--theme-accent-bright)]">Lobby</h1>
        <p className="mt-1 text-sm text-[var(--theme-text-mute)]">Spazi condivisi per il tuo gruppo di gioco</p>
      </header>

      <div className="mx-auto max-w-lg px-4 py-6">
        <div className="mb-6 flex gap-3">
          <button
            className="flex-1 rounded-md bg-[var(--theme-accent)] py-3 text-sm font-semibold text-white"
            onClick={() => setShowCreate(true)}
          >
            + Crea lobby
          </button>
          <button
            className="flex-1 rounded-md border border-[var(--theme-border)] py-3 text-sm font-semibold text-[var(--theme-text)]"
            onClick={() => setShowJoin(true)}
          >
            Unisciti con codice
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-[var(--theme-danger)] px-4 py-3 text-sm text-[var(--theme-danger)]">
            {error}
            <button className="ml-2 text-xs underline" onClick={clearError}>
              Chiudi
            </button>
          </div>
        )}

        {loading && <p className="py-8 text-center text-sm text-[var(--theme-text-mute)]">Caricamento…</p>}

        {!loading && lobbies.length === 0 && (
          <div className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-8 text-center">
            <p className="text-sm text-[var(--theme-text-mute)]">Non sei ancora in nessuna lobby.</p>
            <p className="mt-1 text-xs text-[var(--theme-text-mute)]">Creane una o unisciti con un codice.</p>
          </div>
        )}

        <div className="space-y-3">
          {lobbies.map((lobby) => (
            <div
              key={lobby.id}
              className="cursor-pointer rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 transition hover:border-[var(--theme-accent)]"
              onClick={() => openExisting(lobby)}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-base font-bold text-[var(--theme-accent-bright)]">{lobby.name}</h3>
                    {!lobby.isActive && (
                      <span className="shrink-0 rounded border border-[var(--theme-danger)] px-1.5 py-0.5 text-xs text-[var(--theme-danger)]">
                        Chiusa
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--theme-text-mute)]">
                    Codice: <span className="font-mono font-bold">{lobby.code}</span> · {lobby.memberCount} membro
                    {lobby.memberCount !== 1 ? 'i' : ''} · {lobby.ownerId === uid ? 'Owner' : `Owner: ${lobby.ownerName}`}
                  </p>
                </div>
                {lobby.unreadCount > 0 && (
                  <span className="shrink-0 rounded-full bg-[var(--theme-accent)] px-2 py-1 text-xs font-bold text-white">
                    {lobby.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showCreate && <CreateLobbyModal onConfirm={handleCreate} onCancel={() => setShowCreate(false)} />}
      {showJoin && <JoinLobbyModal onConfirm={handleJoin} onCancel={() => setShowJoin(false)} />}
    </div>
  )
}
