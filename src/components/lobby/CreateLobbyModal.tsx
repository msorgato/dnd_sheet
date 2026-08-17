import { useState } from 'react'

interface Props {
  onConfirm: (name: string) => Promise<void>
  onCancel: () => void
}

export function CreateLobbyModal({ onConfirm, onCancel }: Props) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Inserisci un nome per la lobby.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onConfirm(trimmed)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="w-full max-w-sm rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6">
        <h3 className="mb-4 text-lg font-bold text-[var(--theme-accent-bright)]">Crea nuova lobby</h3>
        <form onSubmit={submit}>
          <label className="mb-1 block text-sm text-[var(--theme-text-soft)]">Nome lobby</label>
          <input
            className="mb-4 w-full rounded border border-[var(--theme-border)] bg-[var(--theme-bg-elev)] px-3 py-2 text-[var(--theme-text)]"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Es. La Discesa nella Fortezza"
            maxLength={60}
            autoFocus
          />
          {error && <p className="mb-3 text-sm text-[var(--theme-danger)]">{error}</p>}
          <div className="flex justify-end gap-3">
            <button type="button" className="rounded-md px-4 py-2 text-sm text-[var(--theme-text-mute)]" onClick={onCancel}>
              Annulla
            </button>
            <button
              type="submit"
              className="rounded-md bg-[var(--theme-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Creazione…' : 'Crea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
