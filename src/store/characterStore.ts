import { create } from 'zustand'
import { auth } from '../lib/firebase'
import { saveCharacter, deleteCharacterDoc, loadCharacters } from '../lib/firestoreSync'
import { maxHitPoints } from '../utils/calculations'
import { resolveClass } from '../utils/classLookup'
import type {
  Character,
  CharacterClassEntry,
  KnownSpell,
  PreparedSpell,
  EquipmentItem,
  AbilityKey,
} from '../types'

function newId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function emptyCharacter(id?: string): Character {
  return {
    id: id ?? newId(),
    name: '',
    speciesId: '',
    backgroundId: '',
    classes: [],
    totalLevel: 0,
    baseAbilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    backgroundAbilityBonus: {},
    skillProficiencies: [],
    skillExpertise: [],
    featIds: [],
    hitPointsRolled: [],
    currentHp: 0,
    tempHp: 0,
    knownSpells: [],
    preparedSpells: [],
    spellSlots: [],
    equipment: [],
    notes: '',
  }
}

function uid(): string | null {
  return auth.currentUser?.uid ?? null
}

function syncChar(char: Character): void {
  const u = uid()
  if (u) saveCharacter(u, char).catch((err) => console.error('[Firestore] saveCharacter failed:', err))
}

interface CharacterState {
  characters: Character[]
  activeId: string | null

  loadFromFirestore: (uid: string) => Promise<void>
  clearStore: () => void

  createCharacter: () => string
  deleteCharacter: (id: string) => void
  setActive: (id: string | null) => void
  getActive: () => Character | undefined

  updateCharacter: (id: string, patch: Partial<Character>) => void
  setAbilityScore: (id: string, key: AbilityKey, value: number) => void
  setBackgroundAbilityBonus: (id: string, bonus: Partial<Record<AbilityKey, number>>) => void

  addClass: (id: string, classId: string) => void
  setClasses: (id: string, classes: CharacterClassEntry[]) => void
  levelUp: (charId: string, classId: string, hpRoll: number) => void

  setSkillProficiency: (id: string, skillId: string, proficient: boolean) => void
  addFeat: (id: string, featId: string) => void
  removeFeat: (id: string, featId: string) => void

  addKnownSpell: (id: string, spell: KnownSpell) => void
  removeKnownSpell: (id: string, spellId: string, classId: string) => void
  prepareSpell: (id: string, spell: PreparedSpell) => void
  unprepareSpell: (id: string, spellId: string, classId: string) => void
  expendSpellSlot: (id: string, classId: string, spellLevel: number) => void
  recoverAllSpellSlots: (id: string) => void

  takeDamage: (id: string, amount: number) => void
  heal: (id: string, amount: number) => void
  setTempHp: (id: string, amount: number) => void
  fullRest: (id: string) => void

  addEquipment: (id: string, item: EquipmentItem) => void
  removeEquipment: (id: string, itemId: string) => void

  wizardDraft: Partial<Character> | null
  setWizardDraft: (draft: Partial<Character> | null) => void
  updateWizardDraft: (patch: Partial<Character>) => void
  commitWizardDraft: () => string | null
}

export const useCharacterStore = create<CharacterState>()((set, get) => ({
  characters: [],
  activeId: null,
  wizardDraft: null,

  loadFromFirestore: async (uid) => {
    const chars = await loadCharacters(uid)
    const merged = chars.map((c) => ({ ...emptyCharacter(c.id), ...c }))
    set({ characters: merged, activeId: null })
  },

  clearStore: () => set({ characters: [], activeId: null, wizardDraft: null }),

  createCharacter: () => {
    const id = newId()
    const c = emptyCharacter(id)
    set((s) => ({ characters: [...s.characters, c], activeId: id }))
    syncChar(c)
    return id
  },

  deleteCharacter: (id) => {
    set((s) => ({
      characters: s.characters.filter((c) => c.id !== id),
      activeId: s.activeId === id ? null : s.activeId,
    }))
    const u = uid()
    if (u) deleteCharacterDoc(u, id).catch(console.error)
  },

  setActive: (id) => set({ activeId: id }),

  getActive: () => {
    const { characters, activeId } = get()
    return characters.find((c) => c.id === activeId)
  },

  updateCharacter: (id, patch) => {
    set((s) => ({ characters: s.characters.map((c) => (c.id === id ? { ...c, ...patch } : c)) }))
    const updated = get().characters.find((c) => c.id === id)
    if (updated) syncChar(updated)
  },

  setAbilityScore: (id, key, value) => {
    set((s) => ({
      characters: s.characters.map((c) =>
        c.id === id ? { ...c, baseAbilityScores: { ...c.baseAbilityScores, [key]: value } } : c,
      ),
    }))
    const updated = get().characters.find((c) => c.id === id)
    if (updated) syncChar(updated)
  },

  setBackgroundAbilityBonus: (id, bonus) => {
    set((s) => ({
      characters: s.characters.map((c) => (c.id === id ? { ...c, backgroundAbilityBonus: bonus } : c)),
    }))
    const updated = get().characters.find((c) => c.id === id)
    if (updated) syncChar(updated)
  },

  addClass: (id, classId) => {
    set((s) => ({
      characters: s.characters.map((c) => {
        if (c.id !== id) return c
        if (c.classes.find((e) => e.classId === classId)) return c
        return { ...c, classes: [...c.classes, { classId, level: 1 }], totalLevel: c.totalLevel + 1 }
      }),
    }))
    const updated = get().characters.find((c) => c.id === id)
    if (updated) syncChar(updated)
  },

  setClasses: (id, classes) => {
    set((s) => ({
      characters: s.characters.map((c) =>
        c.id === id ? { ...c, classes, totalLevel: classes.reduce((sum, e) => sum + e.level, 0) } : c,
      ),
    }))
    const updated = get().characters.find((c) => c.id === id)
    if (updated) syncChar(updated)
  },

  levelUp: (charId, classId, hpRoll) => {
    set((s) => ({
      characters: s.characters.map((c) => {
        if (c.id !== charId) return c
        let classes = c.classes.map((e) => (e.classId === classId ? { ...e, level: e.level + 1 } : e))
        if (!classes.find((e) => e.classId === classId)) {
          classes = [...classes, { classId, level: 1 }]
        }
        const totalLevel = classes.reduce((sum, e) => sum + e.level, 0)
        return { ...c, classes, totalLevel, hitPointsRolled: [...c.hitPointsRolled, hpRoll] }
      }),
    }))
    const updated = get().characters.find((c) => c.id === charId)
    if (updated) syncChar(updated)
  },

  setSkillProficiency: (id, skillId, proficient) => {
    set((s) => ({
      characters: s.characters.map((c) => {
        if (c.id !== id) return c
        const skillProficiencies = proficient
          ? [...new Set([...c.skillProficiencies, skillId])]
          : c.skillProficiencies.filter((sid) => sid !== skillId)
        return { ...c, skillProficiencies }
      }),
    }))
    const updated = get().characters.find((c) => c.id === id)
    if (updated) syncChar(updated)
  },

  addFeat: (id, featId) => {
    set((s) => ({ characters: s.characters.map((c) => (c.id === id ? { ...c, featIds: [...c.featIds, featId] } : c)) }))
    const updated = get().characters.find((c) => c.id === id)
    if (updated) syncChar(updated)
  },

  removeFeat: (id, featId) => {
    set((s) => ({
      characters: s.characters.map((c) => (c.id === id ? { ...c, featIds: c.featIds.filter((f) => f !== featId) } : c)),
    }))
    const updated = get().characters.find((c) => c.id === id)
    if (updated) syncChar(updated)
  },

  addKnownSpell: (id, spell) => {
    set((s) => ({
      characters: s.characters.map((c) => (c.id === id ? { ...c, knownSpells: [...c.knownSpells, spell] } : c)),
    }))
    const updated = get().characters.find((c) => c.id === id)
    if (updated) syncChar(updated)
  },

  removeKnownSpell: (id, spellId, classId) => {
    set((s) => ({
      characters: s.characters.map((c) =>
        c.id === id
          ? { ...c, knownSpells: c.knownSpells.filter((sp) => !(sp.spellId === spellId && sp.classId === classId)) }
          : c,
      ),
    }))
    const updated = get().characters.find((c) => c.id === id)
    if (updated) syncChar(updated)
  },

  prepareSpell: (id, spell) => {
    set((s) => ({
      characters: s.characters.map((c) => (c.id === id ? { ...c, preparedSpells: [...c.preparedSpells, spell] } : c)),
    }))
    const updated = get().characters.find((c) => c.id === id)
    if (updated) syncChar(updated)
  },

  unprepareSpell: (id, spellId, classId) => {
    set((s) => ({
      characters: s.characters.map((c) =>
        c.id === id
          ? { ...c, preparedSpells: c.preparedSpells.filter((sp) => !(sp.spellId === spellId && sp.classId === classId)) }
          : c,
      ),
    }))
    const updated = get().characters.find((c) => c.id === id)
    if (updated) syncChar(updated)
  },

  expendSpellSlot: (id, classId, spellLevel) => {
    set((s) => ({
      characters: s.characters.map((c) => {
        if (c.id !== id) return c
        const existing = c.spellSlots.find((ss) => ss.classId === classId && ss.spellLevel === spellLevel)
        const spellSlots = existing
          ? c.spellSlots.map((ss) =>
              ss.classId === classId && ss.spellLevel === spellLevel ? { ...ss, used: ss.used + 1 } : ss,
            )
          : [...c.spellSlots, { classId, spellLevel, used: 1 }]
        return { ...c, spellSlots }
      }),
    }))
    const updated = get().characters.find((c) => c.id === id)
    if (updated) syncChar(updated)
  },

  recoverAllSpellSlots: (id) => {
    set((s) => ({
      characters: s.characters.map((c) =>
        c.id === id ? { ...c, spellSlots: c.spellSlots.map((ss) => ({ ...ss, used: 0 })) } : c,
      ),
    }))
    const updated = get().characters.find((c) => c.id === id)
    if (updated) syncChar(updated)
  },

  takeDamage: (id, amount) => {
    set((s) => ({
      characters: s.characters.map((c) => {
        if (c.id !== id) return c
        let remaining = amount
        let tempHp = c.tempHp
        if (tempHp > 0) {
          const absorbed = Math.min(tempHp, remaining)
          tempHp -= absorbed
          remaining -= absorbed
        }
        return { ...c, tempHp, currentHp: c.currentHp - remaining }
      }),
    }))
    const updated = get().characters.find((c) => c.id === id)
    if (updated) syncChar(updated)
  },

  heal: (id, amount) => {
    set((s) => ({ characters: s.characters.map((c) => (c.id === id ? { ...c, currentHp: c.currentHp + amount } : c)) }))
    const updated = get().characters.find((c) => c.id === id)
    if (updated) syncChar(updated)
  },

  setTempHp: (id, amount) => {
    set((s) => ({ characters: s.characters.map((c) => (c.id === id ? { ...c, tempHp: amount } : c)) }))
    const updated = get().characters.find((c) => c.id === id)
    if (updated) syncChar(updated)
  },

  fullRest: (id) => {
    set((s) => ({
      characters: s.characters.map((c) =>
        c.id === id
          ? {
              ...c,
              currentHp: maxHitPoints(c),
              tempHp: 0,
              spellSlots: c.spellSlots.map((ss) => ({ ...ss, used: 0 })),
            }
          : c,
      ),
    }))
    const updated = get().characters.find((c) => c.id === id)
    if (updated) syncChar(updated)
  },

  addEquipment: (id, item) => {
    set((s) => ({ characters: s.characters.map((c) => (c.id === id ? { ...c, equipment: [...c.equipment, item] } : c)) }))
    const updated = get().characters.find((c) => c.id === id)
    if (updated) syncChar(updated)
  },

  removeEquipment: (id, itemId) => {
    set((s) => ({
      characters: s.characters.map((c) =>
        c.id === id ? { ...c, equipment: c.equipment.filter((i) => i.id !== itemId) } : c,
      ),
    }))
    const updated = get().characters.find((c) => c.id === id)
    if (updated) syncChar(updated)
  },

  setWizardDraft: (draft) => set({ wizardDraft: draft }),

  updateWizardDraft: (patch) => {
    set((s) => ({ wizardDraft: s.wizardDraft ? { ...s.wizardDraft, ...patch } : { ...patch } }))
  },

  commitWizardDraft: () => {
    const { wizardDraft } = get()
    if (!wizardDraft) return null
    const id = wizardDraft.id ?? newId()
    const full: Character = { ...emptyCharacter(id), ...wizardDraft, id }
    if (full.hitPointsRolled.length === 0 && full.classes.length > 0) {
      const cls = resolveClass(full.classes[0].classId)
      if (cls) full.hitPointsRolled = [cls.hitDie]
    }
    full.currentHp = maxHitPoints(full)
    full.totalLevel = full.classes.reduce((sum, e) => sum + e.level, 0)
    set((s) => ({ characters: [...s.characters, full], activeId: id, wizardDraft: null }))
    syncChar(full)
    return id
  },
}))
