import { useState, useRef, useEffect, useCallback } from 'react'
import type { LobbyMessage } from '../../types'
import { RollMessage } from './RollMessage'

const MAX_CHARS = 2000
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_MS = 60_000

interface Props {
  messages: LobbyMessage[]
  currentUserId: string
  isActive: boolean
  onSend: (content: string) => Promise<void>
}

function formatTime(ms: number): string {
  if (!ms) return ''
  return new Date(ms).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
}

export function ChatPanel({ messages, currentUserId, isActive, onSend }: Props) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [isRateLimited, setIsRateLimited] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const sentTimestampsRef = useRef<number[]>([])
  const rateLimitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  useEffect(() => {
    return () => {
      if (rateLimitTimerRef.current) clearTimeout(rateLimitTimerRef.current)
    }
  }, [])

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now()
    sentTimestampsRef.current = sentTimestampsRef.current.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
    return sentTimestampsRef.current.length >= RATE_LIMIT_MAX
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || isRateLimited) return

    if (checkRateLimit()) {
      setIsRateLimited(true)
      setError('Stai inviando messaggi troppo velocemente. Riprova tra qualche secondo.')
      const oldest = sentTimestampsRef.current[0]
      const msUntilReset = RATE_LIMIT_WINDOW_MS - (Date.now() - oldest) + 100
      rateLimitTimerRef.current = setTimeout(() => {
        setIsRateLimited(false)
        setError('')
      }, msUntilReset)
      return
    }

    setSending(true)
    setError('')
    try {
      await onSend(trimmed)
      sentTimestampsRef.current.push(Date.now())
      setText('')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit(e as unknown as React.FormEvent)
    }
  }

  const charsLeft = MAX_CHARS - text.length
  const isInputDisabled = sending || isRateLimited

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-[var(--theme-text-mute)]">Nessun messaggio. Sii il primo a scrivere!</p>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUserId
          if (msg.type === 'roll' && msg.rollData) {
            return <RollMessage key={msg.id} msg={msg} isMine={isMine} />
          }
          return (
            <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
              <div
                className="max-w-[75%] rounded-lg border px-3 py-2 text-sm text-[var(--theme-text)]"
                style={{
                  background: isMine ? 'rgba(220,38,38,0.15)' : 'var(--theme-bg-elev)',
                  borderColor: isMine ? 'var(--theme-accent)' : 'var(--theme-border)',
                  wordBreak: 'break-word',
                }}
              >
                {!isMine && <p className="mb-1 text-xs font-semibold text-[var(--theme-accent-bright)]">{msg.senderName}</p>}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
              <span className="mt-0.5 px-1 text-xs text-[var(--theme-text-mute)]">{formatTime(msg.sentAt)}</span>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {isActive ? (
        <form onSubmit={submit} className="flex gap-2 border-t border-[var(--theme-border)] p-3">
          <div className="flex flex-1 flex-col gap-1">
            <textarea
              className="resize-none rounded border border-[var(--theme-border)] bg-[var(--theme-bg-elev)] px-2 py-1 text-sm text-[var(--theme-text)]"
              rows={2}
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                setError('')
              }}
              onKeyDown={handleKeyDown}
              placeholder={isRateLimited ? 'Attendi prima di inviare altri messaggi…' : 'Scrivi un messaggio… (Invio per inviare)'}
              disabled={isInputDisabled}
              maxLength={MAX_CHARS}
            />
            {text.length > 0 && (
              <span className={`pr-1 text-right text-xs ${charsLeft < 100 ? 'text-[var(--theme-danger)]' : 'text-[var(--theme-text-mute)]'}`}>
                {charsLeft}
              </span>
            )}
          </div>
          <button
            type="submit"
            className="self-end rounded-md bg-[var(--theme-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            disabled={isInputDisabled || !text.trim()}
          >
            {sending ? '…' : 'Invia'}
          </button>
        </form>
      ) : (
        <div className="border-t border-[var(--theme-border)] p-3 text-center text-sm text-[var(--theme-text-mute)]">
          Questa lobby è chiusa. Non è possibile inviare nuovi messaggi.
        </div>
      )}
      {error && <p className="px-3 pb-2 text-xs text-[var(--theme-danger)]">{error}</p>}
    </div>
  )
}
