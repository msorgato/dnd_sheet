import type { LobbyMember } from '../../types'

interface Props {
  members: LobbyMember[]
  ownerId: string
  gmUid?: string
  currentUserId?: string
  onTransferGM?: (uid: string, name: string) => void
}

export function MembersList({ members, ownerId, gmUid, currentUserId, onTransferGM }: Props) {
  const effectiveGmUid = gmUid ?? ownerId
  const isCurrentUserGM = currentUserId === effectiveGmUid

  if (members.length === 0) {
    return <p className="py-4 text-center text-sm text-[var(--theme-text-mute)]">Nessun membro</p>
  }

  return (
    <ul className="space-y-2">
      {members.map((m) => {
        const isGM = m.userId === effectiveGmUid
        const canTransfer = isCurrentUserGM && !isGM && !!onTransferGM
        return (
          <li
            key={m.userId}
            className="flex items-center justify-between gap-2 rounded border border-[var(--theme-border)] bg-[var(--theme-bg-elev)] px-3 py-2"
          >
            <span className="truncate text-sm font-medium text-[var(--theme-text)]">{m.displayName}</span>
            <div className="flex shrink-0 items-center gap-1.5">
              {isGM && (
                <span className="rounded border border-[var(--theme-accent)] bg-[var(--theme-accent)]/20 px-2 py-0.5 text-xs font-semibold text-[var(--theme-accent-bright)]">
                  GM
                </span>
              )}
              {!isGM && m.userId === ownerId && (
                <span className="rounded border border-[var(--theme-border)] px-2 py-0.5 text-xs font-semibold text-[var(--theme-text-mute)]">
                  Owner
                </span>
              )}
              {canTransfer && (
                <button
                  className="rounded border border-[var(--theme-border)] px-2 py-0.5 text-xs text-[var(--theme-text-mute)]"
                  onClick={() => onTransferGM(m.userId, m.displayName)}
                  title="Trasferisci ruolo GM"
                >
                  ⇒ GM
                </button>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
