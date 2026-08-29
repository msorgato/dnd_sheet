import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useLobbyStore } from '../store/lobbyStore'
import { useCharacterStore } from '../store/characterStore'
import { ChatPanel } from '../components/lobby/ChatPanel'
import { MembersList } from '../components/lobby/MembersList'
import { LobbySheetPanel } from '../components/lobby/LobbySheetPanel'
import { CharacterSelectBar } from '../components/lobby/CharacterSelectBar'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { getUserLobbies } from '../lib/lobbySync'
import type { RollResultData } from '../types'

export function LobbyDetailPage() {
  const { id: lobbyId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    activeLobby,
    members,
    messages,
    activeCharacterId,
    isHiddenRollEnabled,
    loading,
    error,
    openLobby,
    closeLobbyView,
    leaveLobby,
    closeLobby,
    sendMessage,
    sendRollMessage,
    setActiveCharacter,
    toggleHiddenRoll,
    transferGMRole,
    clearError,
  } = useLobbyStore()
  const uid = user?.uid ?? ''
  const displayName = user?.displayName ?? user?.email ?? 'Utente'
  const isGM = useLobbyStore((s) => {
    if (!s.activeLobby) return false
    return (s.activeLobby.gmUid ?? s.activeLobby.ownerId) === uid
  })
  const { characters, loadFromFirestore } = useCharacterStore()

  const [confirmLeave, setConfirmLeave] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)
  const [confirmTransferGM, setConfirmTransferGM] = useState<{ uid: string; name: string } | null>(null)

  // Se si arriva qui direttamente (refresh), la lobby va ricaricata da Firestore.
  // Nessuno stato di loading dedicato: finché activeLobby non corrisponde a lobbyId, siamo in attesa.
  const loadingLobby = !!lobbyId && !!uid && activeLobby?.id !== lobbyId

  useEffect(() => {
    if (!lobbyId || !uid) return
    if (activeLobby?.id === lobbyId) return

    getUserLobbies(uid)
      .then((lobbies) => {
        const found = lobbies.find((l) => l.id === lobbyId)
        if (found) {
          openLobby(uid, found)
        } else {
          navigate('/lobbies', { replace: true })
        }
      })
      .catch(() => navigate('/lobbies', { replace: true }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lobbyId, uid])

  useEffect(() => {
    if (!uid || characters.length > 0) return
    loadFromFirestore(uid).catch(console.error)
  }, [uid, characters.length, loadFromFirestore])

  const charLoading = !!activeCharacterId && !characters.some((c) => c.id === activeCharacterId)

  useEffect(() => {
    if (!activeCharacterId || !uid) return
    const found = characters.some((c) => c.id === activeCharacterId)
    if (!found) {
      loadFromFirestore(uid).catch(console.error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCharacterId])

  const goBack = () => {
    closeLobbyView()
    navigate('/lobbies')
  }

  const handleLeave = async () => {
    await leaveLobby(uid, lobbyId!)
    navigate('/lobbies')
  }

  const handleClose = async () => {
    await closeLobby(uid, lobbyId!)
    navigate('/lobbies')
  }

  const handleSend = async (content: string) => {
    await sendMessage(uid, displayName, lobbyId!, content)
  }

  const handleRollResult = useCallback(
    async (rollData: RollResultData) => {
      try {
        await sendRollMessage(uid, displayName, lobbyId!, rollData, isHiddenRollEnabled ? true : undefined)
      } catch {
        // errore già in store
      }
    },
    [uid, displayName, lobbyId, sendRollMessage, isHiddenRollEnabled],
  )

  const handleTransferGM = (targetUid: string, targetName: string) => {
    setConfirmTransferGM({ uid: targetUid, name: targetName })
  }

  const handleConfirmTransferGM = async () => {
    if (!confirmTransferGM) return
    try {
      await transferGMRole(uid, lobbyId!, confirmTransferGM.uid)
    } catch {
      // errore già in store
    } finally {
      setConfirmTransferGM(null)
    }
  }

  const handleSelectCharacter = async (charId: string | null) => {
    await setActiveCharacter(uid, charId)
  }

  const activeCharacter = activeCharacterId ? characters.find((c) => c.id === activeCharacterId) ?? null : null
  const isOwner = activeLobby?.ownerId === uid

  if (loadingLobby || (!activeLobby && loading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--theme-bg)] text-[var(--theme-accent)]">
        <div className="text-4xl">✦</div>
      </div>
    )
  }

  if (!activeLobby) return null

  return (
    <div className="flex min-h-screen flex-col bg-[var(--theme-bg)]">
      <header className="flex items-center gap-3 border-b border-[var(--theme-border)] px-4 py-3">
        <button className="text-sm text-[var(--theme-text-mute)] hover:text-[var(--theme-text)]" onClick={goBack}>
          ←
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-base font-bold text-[var(--theme-accent-bright)]">{activeLobby.name}</h1>
            {!activeLobby.isActive && (
              <span className="shrink-0 rounded border border-[var(--theme-danger)] px-1.5 py-0.5 text-xs text-[var(--theme-danger)]">
                Chiusa
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--theme-text-mute)]">
            Codice: <span className="font-mono font-bold">{activeLobby.code}</span> · {members.length} membro
            {members.length !== 1 ? 'i' : ''}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {isOwner && activeLobby.isActive && (
            <button
              className="rounded border border-[var(--theme-danger)] px-3 py-1 text-xs text-[var(--theme-danger)]"
              onClick={() => setConfirmClose(true)}
            >
              Chiudi
            </button>
          )}
          {!isOwner && activeLobby.isActive && (
            <button className="rounded border border-[var(--theme-border)] px-3 py-1 text-xs text-[var(--theme-text)]" onClick={() => setConfirmLeave(true)}>
              Lascia
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="shrink-0 px-4 py-2 text-sm text-[var(--theme-danger)]">
          {error}
          <button className="ml-2 text-xs underline" onClick={clearError}>
            Chiudi
          </button>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        <aside className="w-full shrink-0 overflow-y-auto border-b border-[var(--theme-border)] p-3 md:w-48 md:border-b-0 md:border-r">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--theme-text-mute)]">Partecipanti</h2>
          <MembersList members={members} ownerId={activeLobby.ownerId} gmUid={activeLobby.gmUid} currentUserId={uid} onTransferGM={handleTransferGM} />
        </aside>

        <div className="flex flex-[3] flex-col overflow-hidden border-b border-[var(--theme-border)] md:border-b-0 md:border-r" style={{ minHeight: 320 }}>
          <ChatPanel messages={messages} currentUserId={uid} isActive={activeLobby.isActive} onSend={handleSend} />
        </div>

        <div className="flex flex-[2] flex-col overflow-hidden">
          <div className="shrink-0 px-3 pb-1 pt-2">
            <CharacterSelectBar characters={characters} activeCharacterId={activeCharacterId} onSelect={handleSelectCharacter} />
          </div>
          {isGM && (
            <div className="shrink-0 border-b border-[var(--theme-border)] px-3 py-1">
              <button
                className="text-xs font-semibold"
                style={{ color: isHiddenRollEnabled ? 'var(--theme-accent-bright)' : 'var(--theme-text-mute)' }}
                onClick={toggleHiddenRoll}
                title={isHiddenRollEnabled ? 'Tiro nascosto attivo — clicca per disattivare' : 'Clicca per attivare il tiro nascosto'}
              >
                Tiro nascosto: {isHiddenRollEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          )}
          <LobbySheetPanel character={activeCharacter} loading={charLoading} onRollResult={handleRollResult} />
        </div>
      </div>

      {confirmLeave && (
        <ConfirmModal
          title="Lascia lobby"
          message={`Vuoi abbandonare la lobby "${activeLobby.name}"?`}
          confirmLabel="Lascia"
          danger
          onConfirm={handleLeave}
          onCancel={() => setConfirmLeave(false)}
        />
      )}
      {confirmClose && (
        <ConfirmModal
          title="Chiudi lobby"
          message={`Vuoi chiudere la lobby "${activeLobby.name}"? I messaggi restano visibili ma non sarà più possibile scrivere o unirsi.`}
          confirmLabel="Chiudi lobby"
          danger
          onConfirm={handleClose}
          onCancel={() => setConfirmClose(false)}
        />
      )}
      {confirmTransferGM && (
        <ConfirmModal
          title="Trasferisci ruolo GM"
          message={`Vuoi trasferire il ruolo GM a "${confirmTransferGM.name}"? Perderai immediatamente tutti i privilegi GM.`}
          confirmLabel="Trasferisci"
          danger
          onConfirm={handleConfirmTransferGM}
          onCancel={() => setConfirmTransferGM(null)}
        />
      )}
    </div>
  )
}
