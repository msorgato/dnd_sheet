import { useState } from 'react'

interface Props {
  onConfirm: (code: string) => Promise<void>
  onCancel: () => void
}

export function JoinLobbyModal({ onConfirm, onCancel }: Props) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (trimmed.length !== 6) {
      setError('Il codice deve essere di 6 caratteri.')
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
        <h3 className="mb-4 text-lg font-bold text-[var(--theme-accent-bright)]">Unisciti a una lobby</h3>
        <form onSubmit={submit}>
          <label className="mb-1 block text-sm text-[var(--theme-text-soft)]">Codice lobby (6 caratteri)</label>
          <input
            className="mb-4 w-full rounded border border-[var(--theme-border)] bg-[var(--theme-bg-elev)] px-3 py-2 text-center font-mono text-lg uppercase tracking-widest text-[var(--theme-text)]"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
            placeholder="ABCD12"
            maxLength={6}
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
              {loading ? 'Connessione…' : 'Entra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
