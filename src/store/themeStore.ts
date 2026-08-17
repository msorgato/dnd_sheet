import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ThemeId } from '../themes'
import { migrateThemeId } from '../themes'

interface ThemeState {
  theme: ThemeId
  setTheme: (t: ThemeId) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'crimson',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'dnd-sheet-theme',
      onRehydrateStorage: () => (state) => {
        if (state && typeof state.theme === 'string') {
          state.theme = migrateThemeId(state.theme)
        }
      },
    },
  ),
)
