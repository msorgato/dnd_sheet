export type ThemeId = 'crimson' | 'obsidian'

export interface ThemeDef {
  id: ThemeId
  label: string
  swatch1: string
  swatch2: string
}

export const THEMES: ThemeDef[] = [
  { id: 'crimson', label: 'Cremisi', swatch1: '#1a0a0a', swatch2: '#dc2626' },
  { id: 'obsidian', label: 'Ossidiana', swatch1: '#0b0f14', swatch2: '#14b8a6' },
]

export function migrateThemeId(raw: string): ThemeId {
  return raw === 'crimson' || raw === 'obsidian' ? raw : 'crimson'
}
