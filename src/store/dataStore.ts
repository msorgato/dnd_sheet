import { create } from 'zustand'
import { FEATS } from '../data/feats'
import { SPELLS } from '../data/spells'
import type { FeatDefinition, SpellDefinition, CustomClassDefinition } from '../types'

interface DataState {
  builtinFeats: FeatDefinition[]
  builtinSpells: SpellDefinition[]
  builtinLoaded: boolean

  loadBuiltinData: () => Promise<void>
  clearStore: () => void

  // Bozze di classi custom dell'admin corrente (users/{uid}/customClasses)
  customClasses: CustomClassDefinition[]
  setCustomClasses: (classes: CustomClassDefinition[]) => void
  upsertCustomClass: (cls: CustomClassDefinition) => void
  removeCustomClass: (classId: string) => void

  // Classi pubblicate in library/classes/entries, visibili a tutti gli utenti
  publishedCustomClasses: CustomClassDefinition[]
  setPublishedCustomClasses: (classes: CustomClassDefinition[]) => void
}

export const useDataStore = create<DataState>()((set) => ({
  builtinFeats: [...FEATS],
  builtinSpells: [...SPELLS],
  builtinLoaded: false,
  customClasses: [],
  publishedCustomClasses: [],

  loadBuiltinData: async () => {
    const [spellsRes, featsRes] = await Promise.all([fetch('/data/spells.json'), fetch('/data/feats.json')])
    const [spellsData, featsData] = await Promise.all([
      spellsRes.json() as Promise<{ spells: SpellDefinition[] }>,
      featsRes.json() as Promise<{ feats: FeatDefinition[] }>,
    ])
    set({
      builtinSpells: spellsData.spells ?? [],
      builtinFeats: featsData.feats ?? [],
      builtinLoaded: true,
    })
  },

  clearStore: () => set({ customClasses: [], publishedCustomClasses: [] }),

  setCustomClasses: (classes) => set({ customClasses: classes }),

  upsertCustomClass: (cls) =>
    set((s) => ({
      customClasses: [...s.customClasses.filter((c) => c.id !== cls.id), cls],
    })),

  removeCustomClass: (classId) => set((s) => ({ customClasses: s.customClasses.filter((c) => c.id !== classId) })),

  setPublishedCustomClasses: (classes) => set({ publishedCustomClasses: classes }),
}))
