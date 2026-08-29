import type { ReactNode } from 'react'

interface Props {
  step: number
  title: string
  children: ReactNode
  onBack?: () => void
  onNext?: () => void
  nextLabel?: string
  nextDisabled?: boolean
}

const STEPS = ['Specie', 'Classe', 'Background', 'Caratteristiche', 'Competenze', 'Dettagli']

export function WizardLayout({ step, title, children, onBack, onNext, nextLabel = 'Avanti', nextDisabled = false }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--theme-bg)]">
      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold text-[var(--theme-text)]">Creazione Personaggio</h1>
        <p className="mt-1 text-sm text-[var(--theme-accent-bright)]">{title}</p>
      </div>

      <div className="border-b border-[var(--theme-border)] px-6 py-3">
        <div className="mb-2 flex gap-1">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className="h-1.5 flex-1 rounded-full"
              style={{ background: i < step ? 'var(--theme-accent)' : 'var(--theme-border)' }}
            />
          ))}
        </div>
        <div className="flex gap-4 overflow-x-auto text-xs">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={`whitespace-nowrap ${
                i === step - 1 ? 'font-bold text-[var(--theme-accent-bright)]' : 'text-[var(--theme-text-mute)]'
              }`}
            >
              {i + 1}. {s}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-4 py-6">{children}</div>

      <div className="flex justify-between gap-4 border-t border-[var(--theme-border)] px-6 py-4">
        <button
          className="rounded-md px-4 py-2 text-sm text-[var(--theme-text-mute)] hover:text-[var(--theme-text)] disabled:opacity-40"
          onClick={onBack}
          disabled={!onBack}
        >
          ← Indietro
        </button>
        <button
          className="rounded-md bg-[var(--theme-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--theme-accent-bright)] disabled:opacity-40"
          onClick={onNext}
          disabled={nextDisabled || !onNext}
        >
          {nextLabel} →
        </button>
      </div>
    </div>
  )
}
