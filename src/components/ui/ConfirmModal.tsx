interface Props {
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({ title, message, confirmLabel = 'Conferma', danger = false, onConfirm, onCancel }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="w-full max-w-sm rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6">
        <h3 className={`mb-2 text-lg font-bold ${danger ? 'text-[var(--theme-danger)]' : 'text-[var(--theme-accent)]'}`}>
          {title}
        </h3>
        <p className="mb-6 text-sm text-[var(--theme-text-soft)]">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            className="rounded-md px-4 py-2 text-sm text-[var(--theme-text-mute)] hover:text-[var(--theme-text)]"
            onClick={onCancel}
          >
            Annulla
          </button>
          <button
            className={`rounded-md px-4 py-2 text-sm font-semibold ${
              danger
                ? 'border border-[var(--theme-danger)] text-[var(--theme-danger)]'
                : 'border border-[var(--theme-accent)] text-[var(--theme-accent-bright)]'
            }`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
