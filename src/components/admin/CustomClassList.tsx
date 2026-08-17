import { useEffect, useState } from 'react'
import { useDataStore } from '../../store/dataStore'
import { useAuthStore } from '../../store/authStore'
import { loadCustomClasses, saveCustomClass, deleteCustomClass, publishCustomClass, withdrawCustomClass } from '../../lib/firestoreSync'
import { CustomClassEditor } from './CustomClassEditor'
import type { CustomClassDefinition } from '../../types'

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

/** Isolato a livello di modulo: le regole di purezza di React vietano `Date.now()` diretto nel corpo del componente. */
function timestamp(): number {
  return Date.now()
}

function newEmptyClass(authorId: string): CustomClassDefinition {
  const now = Date.now()
  return {
    id: `cls_${genId()}`,
    name: '',
    description: '',
    hitDie: 8,
    savingThrowProficiencies: ['str', 'con'],
    skillChoices: { count: 2, from: [] },
    armorProficiencies: [],
    weaponProficiencies: [],
    featuresByLevel: {},
    authorId,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  }
}

function statusBadge(cls: CustomClassDefinition): { label: string; className: string } {
  if (cls.status === 'draft') return { label: 'Bozza', className: 'text-[var(--theme-text-mute)]' }
  const hasUnpublished = cls.publishedAt != null && cls.updatedAt > cls.publishedAt
  if (hasUnpublished) return { label: 'Modifiche non pubblicate', className: 'text-[var(--theme-hp-mid)]' }
  return { label: 'Pubblicata', className: 'text-[var(--theme-hp-high)]' }
}

export function CustomClassList() {
  const user = useAuthStore((s) => s.user)
  const customClasses = useDataStore((s) => s.customClasses)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [loadedForUid, setLoadedForUid] = useState<string | null>(null)
  const loading = !!user && loadedForUid !== user.uid

  useEffect(() => {
    if (!user || loadedForUid === user.uid) return
    loadCustomClasses(user.uid)
      .then((cls) => {
        useDataStore.getState().setCustomClasses(cls)
        setLoadedForUid(user.uid)
      })
      .catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, loadedForUid])

  async function handleAdd() {
    if (!user) return
    const cls = newEmptyClass(user.uid)
    setBusy(cls.id)
    try {
      await saveCustomClass(user.uid, cls)
      useDataStore.getState().upsertCustomClass(cls)
      setExpanded(cls.id)
    } catch (e) {
      console.error('[CustomClassList] add failed:', e)
    } finally {
      setBusy(null)
    }
  }

  async function handleSave(updated: CustomClassDefinition) {
    if (!user) return
    const withTimestamp = { ...updated, updatedAt: timestamp() }
    setBusy(updated.id)
    try {
      await saveCustomClass(user.uid, withTimestamp)
      useDataStore.getState().upsertCustomClass(withTimestamp)
    } catch (e) {
      console.error('[CustomClassList] save failed:', e)
    } finally {
      setBusy(null)
    }
  }

  async function handleDelete(cls: CustomClassDefinition) {
    if (!user) return
    const name = cls.name || 'senza nome'
    if (!window.confirm(`Eliminare la classe "${name}"? Questa azione non è reversibile.`)) return
    setBusy(cls.id)
    try {
      await deleteCustomClass(user.uid, cls.id)
      useDataStore.getState().removeCustomClass(cls.id)
      setExpanded(null)
    } catch (e) {
      console.error('[CustomClassList] delete failed:', e)
    } finally {
      setBusy(null)
    }
  }

  async function handlePublish(cls: CustomClassDefinition) {
    if (!user) return
    setBusy(cls.id)
    try {
      await publishCustomClass(user.uid, cls)
      const now = timestamp()
      useDataStore.getState().upsertCustomClass({ ...cls, status: 'published', publishedAt: now, updatedAt: now })
    } catch (e) {
      console.error('[CustomClassList] publish failed:', e)
    } finally {
      setBusy(null)
    }
  }

  async function handleWithdraw(cls: CustomClassDefinition) {
    if (!user) return
    setBusy(cls.id)
    try {
      await withdrawCustomClass(user.uid, cls.id)
      useDataStore.getState().upsertCustomClass({ ...cls, status: 'draft', updatedAt: timestamp() })
    } catch (e) {
      console.error('[CustomClassList] withdraw failed:', e)
    } finally {
      setBusy(null)
    }
  }

  if (loading) {
    return <p className="py-16 text-center text-sm text-[var(--theme-text-mute)]">Caricamento…</p>
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-[var(--theme-text-mute)]">
          {customClasses.length} {customClasses.length === 1 ? 'classe' : 'classi'}
        </span>
        <button
          className="rounded-md bg-[var(--theme-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          onClick={handleAdd}
          disabled={!!busy}
        >
          + Aggiungi classe
        </button>
      </div>

      {customClasses.length === 0 && (
        <p className="py-12 text-center text-sm text-[var(--theme-text-mute)]">
          Nessuna classe custom. Clicca "+ Aggiungi classe" per iniziare.
        </p>
      )}

      <div className="space-y-2">
        {customClasses.map((cls) => {
          const badge = statusBadge(cls)
          const isOpen = expanded === cls.id
          const isBusy = busy === cls.id
          return (
            <div key={cls.id}>
              <button
                className="flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-left"
                style={{ borderColor: isOpen ? 'var(--theme-accent)' : 'var(--theme-border)', background: 'var(--theme-surface)', opacity: isBusy ? 0.6 : 1 }}
                onClick={() => !isBusy && setExpanded(isOpen ? null : cls.id)}
                disabled={isBusy}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="font-semibold text-sm text-[var(--theme-accent-bright)]">{cls.name || 'senza nome'}</span>
                  <span className={`text-xs ${badge.className}`}>{badge.label}</span>
                </div>
                <span className="text-[var(--theme-text-mute)]">{isOpen ? '▲' : '▼'}</span>
              </button>
              {isOpen && (
                <div className="mt-1 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4">
                  <CustomClassEditor
                    key={cls.updatedAt}
                    cls={cls}
                    onSave={handleSave}
                    onDelete={() => handleDelete(cls)}
                    onPublish={() => handlePublish(cls)}
                    onWithdraw={() => handleWithdraw(cls)}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
