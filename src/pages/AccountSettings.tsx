import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { deleteUser, reauthenticateWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { useAuthStore } from '../store/authStore'
import { auth } from '../lib/firebase'

type DeleteStep = 'idle' | 'confirm' | 'deleting' | 'error'

export function AccountSettings() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()

  const [deleteStep, setDeleteStep] = useState<DeleteStep>('idle')
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleDelete() {
    if (!user) return
    setDeleteStep('deleting')
    setDeleteError(null)
    try {
      // Prova prima la Cloud Function (richiede piano Blaze e deploy).
      const fn = httpsCallable(getFunctions(), 'deleteUserAccount')
      await fn()
      await signOut()
    } catch (cfErr: unknown) {
      // Cloud Function non ancora distribuita — fallback lato client.
      const code = (cfErr as { code?: string }).code
      if (code === 'functions/not-found' || code === 'functions/unavailable' || code === 'functions/internal') {
        try {
          const currentUser = auth.currentUser
          if (!currentUser) throw new Error('Nessun utente attivo', { cause: cfErr })
          await reauthenticateWithPopup(currentUser, new GoogleAuthProvider())
          await deleteUser(currentUser)
          // La cancellazione dell'account innesca onAuthStateChanged → il redirect a /login avviene automaticamente.
        } catch (authErr: unknown) {
          const authCode = (authErr as { code?: string }).code
          if (authCode === 'auth/requires-recent-login') {
            setDeleteError('Effettua di nuovo il login e riprova.')
          } else {
            setDeleteError((authErr as Error).message ?? "Errore durante l'eliminazione")
          }
          setDeleteStep('error')
        }
      } else {
        setDeleteError((cfErr as Error).message ?? "Errore durante l'eliminazione")
        setDeleteStep('error')
      }
    }
  }

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)]">
      <header className="flex items-center gap-3 border-b border-[var(--theme-border)] px-6 py-4">
        <button className="text-sm text-[var(--theme-text-mute)] hover:text-[var(--theme-text)]" onClick={() => navigate('/')}>
          ← Indietro
        </button>
        <h1 className="text-lg font-bold text-[var(--theme-accent-bright)]">Impostazioni Account</h1>
      </header>

      <div className="mx-auto max-w-xl p-6">
        <div className="rounded-lg border border-[var(--theme-danger)] bg-[var(--theme-surface)] p-5">
          <h2 className="mb-1 text-base font-bold text-[var(--theme-danger)]">Elimina account</h2>
          <p className="mb-4 text-sm text-[var(--theme-text-mute)]">
            Rimuove in modo permanente il tuo account, i tuoi personaggi e tutti i dati associati. L'operazione è irreversibile.
          </p>

          {deleteStep === 'idle' && (
            <button
              className="rounded-md border border-[var(--theme-danger)] px-4 py-2 text-sm text-[var(--theme-danger)]"
              onClick={() => setDeleteStep('confirm')}
            >
              Elimina account
            </button>
          )}

          {deleteStep === 'confirm' && (
            <div className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-bg-elev)] p-4">
              <p className="mb-3 text-sm font-semibold text-[var(--theme-text)]">Sei sicuro? Questa azione non può essere annullata.</p>
              <div className="flex gap-2">
                <button
                  className="rounded-md border border-[var(--theme-danger)] px-4 py-2 text-sm text-[var(--theme-danger)]"
                  onClick={handleDelete}
                >
                  Sì, elimina il mio account
                </button>
                <button className="rounded-md px-4 py-2 text-sm text-[var(--theme-text-mute)]" onClick={() => setDeleteStep('idle')}>
                  Annulla
                </button>
              </div>
            </div>
          )}

          {deleteStep === 'deleting' && <p className="text-sm text-[var(--theme-text-mute)]">Eliminazione in corso…</p>}

          {deleteStep === 'error' && (
            <div>
              <p className="mb-2 text-sm text-[var(--theme-danger)]">{deleteError}</p>
              <button className="rounded-md border border-[var(--theme-border)] px-3 py-1 text-sm text-[var(--theme-text)]" onClick={() => setDeleteStep('idle')}>
                Riprova
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
