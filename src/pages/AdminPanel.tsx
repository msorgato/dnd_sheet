import { useNavigate } from 'react-router-dom'
import { CustomClassList } from '../components/admin/CustomClassList'

export function AdminPanel() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[var(--theme-bg)]">
      <header className="flex items-center justify-between border-b border-[var(--theme-border)] px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--theme-accent-bright)]">Pannello Amministrativo</h1>
          <p className="mt-0.5 text-xs text-[var(--theme-text-mute)]">Crea e pubblica classi custom nella libreria condivisa</p>
        </div>
        <button className="text-sm text-[var(--theme-text-mute)] hover:text-[var(--theme-text)]" onClick={() => navigate('/')}>
          ← Home
        </button>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6">
        <CustomClassList />
      </div>
    </div>
  )
}
