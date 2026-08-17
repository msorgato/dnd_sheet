import type { LobbyMessage } from '../../types'

interface Props {
  msg: LobbyMessage
  isMine: boolean
}

function formatTime(ms: number): string {
  if (!ms) return ''
  return new Date(ms).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
}

function modStr(v: number): string {
  return v === 0 ? '' : v > 0 ? `+${v}` : `${v}`
}

export function RollMessage({ msg, isMine }: Props) {
  const roll = msg.rollData!
  const crit = roll.isCrit === true
  const fumble = roll.isFumble === true

  const borderColor = crit ? 'var(--theme-hp-high)' : fumble ? 'var(--theme-danger)' : 'var(--theme-accent)'
  const totalColor = crit ? 'var(--theme-hp-high)' : fumble ? 'var(--theme-danger)' : 'var(--theme-accent-bright)'
  const bg = crit ? 'rgba(74,222,128,0.08)' : fumble ? 'rgba(239,68,68,0.08)' : 'rgba(220,38,38,0.06)'

  return (
    <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
      <div className="max-w-[80%] rounded-lg px-3 py-2" style={{ background: bg, border: `1px solid ${borderColor}` }}>
        {!isMine && <p className="mb-1 text-xs font-semibold text-[var(--theme-accent-bright)]">{msg.senderName}</p>}
        <div className="mb-1 flex items-baseline gap-1.5">
          <span className="text-xs font-bold text-[var(--theme-text-soft)]">{roll.characterName}</span>
          <span className="text-xs text-[var(--theme-text-mute)]">·</span>
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: totalColor }}>
            {roll.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-[var(--theme-text-mute)]">{roll.formula}</span>
          <span className="text-xs text-[var(--theme-text-mute)]">=</span>
          <span className="text-2xl font-bold leading-none" style={{ color: totalColor }}>
            {roll.total}
          </span>
        </div>
        <div className="mt-0.5 text-xs text-[var(--theme-text-mute)]">
          [{roll.rolls.join(', ')}]{modStr(roll.modifier) ? ` ${modStr(roll.modifier)}` : ''}
        </div>
        {crit && <div className="mt-1 text-xs font-bold text-[var(--theme-hp-high)]">CRITICO!</div>}
        {fumble && <div className="mt-1 text-xs font-bold text-[var(--theme-danger)]">FALLIMENTO CRITICO!</div>}
        {isMine && msg.hidden && (
          <div className="mt-1 flex items-center gap-1 text-xs text-[var(--theme-text-mute)]">
            <span>Nascosto</span>
          </div>
        )}
      </div>
      <span className="mt-0.5 px-1 text-xs text-[var(--theme-text-mute)]">{formatTime(msg.sentAt)}</span>
    </div>
  )
}
