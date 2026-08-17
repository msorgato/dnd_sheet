import { useAuthStore } from '../store/authStore'

export function LoginPage() {
  const { signInWithGoogle, loading } = useAuthStore()

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--theme-bg)]">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-10 text-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--theme-text)]">dnd_sheet</h1>
          <p className="mt-1 text-sm text-[var(--theme-text-mute)]">Gestione Schede Personaggio D&D</p>
        </div>

        <button
          className="w-full rounded-md bg-[var(--theme-accent)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--theme-accent-bright)] disabled:opacity-60"
          onClick={signInWithGoogle}
          disabled={loading}
        >
          Accedi con Google
        </button>

        <p className="text-xs text-[var(--theme-text-mute)]">
          I tuoi personaggi vengono salvati nel cloud e sono accessibili da qualsiasi dispositivo.
        </p>
      </div>
    </div>
  )
}
