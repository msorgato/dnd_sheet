import { describe, it, expect, beforeEach, vi } from 'vitest'

// characterStore legge `auth.currentUser` e sincronizza su Firestore ad ogni modifica:
// mockiamo entrambi i moduli per non inizializzare il vero SDK Firebase nei test.
vi.mock('../lib/firebase', () => ({ auth: { currentUser: null } }))
vi.mock('../lib/firestoreSync', () => ({
  saveCharacter: vi.fn(),
  deleteCharacterDoc: vi.fn(),
  loadCharacters: vi.fn(() => Promise.resolve([])),
}))

import { useCharacterStore } from '../store/characterStore'
import { getBackground } from '../data/backgrounds'
import { getClass } from '../data/classes'
import { maxHitPoints } from '../utils/calculations'
import type { AbilityScores } from '../types'

/**
 * Simula il percorso del wizard (Step1_Species → Step6_Details) usando solo
 * i dati segnaposto built-in, per verificare lo scenario "wizard completabile
 * con i soli dati segnaposto" della capability character-creation.
 */
describe('flusso di creazione personaggio (dati segnaposto)', () => {
  beforeEach(() => {
    useCharacterStore.getState().clearStore()
  })

  it('completa il wizard e produce un personaggio valido', () => {
    const speciesId = 'umano'
    const classId = 'guerriero'
    const backgroundId = 'soldato'
    const background = getBackground(backgroundId)
    const klass = getClass(classId)
    expect(background).toBeDefined()
    expect(klass).toBeDefined()

    const baseAbilityScores: AbilityScores = { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 }
    const backgroundAbilityBonus = { str: 2, con: 1 }
    const skillProficiencies = [...(background?.skillProficiencies ?? []), 'atletica', 'percezione']

    const store = useCharacterStore.getState()
    store.setWizardDraft({})
    store.updateWizardDraft({
      name: 'Aldric',
      speciesId,
      backgroundId,
      classes: [{ classId, level: 1 }],
      baseAbilityScores,
      backgroundAbilityBonus,
      skillProficiencies,
      featIds: background ? [background.originFeatId] : [],
    })

    const id = store.commitWizardDraft()
    expect(id).not.toBeNull()

    const character = useCharacterStore.getState().characters.find((c) => c.id === id)
    expect(character).toBeDefined()
    if (!character) return

    expect(character.speciesId).toBe(speciesId)
    expect(character.classes).toEqual([{ classId, level: 1 }])
    expect(character.totalLevel).toBe(1)
    expect(character.hitPointsRolled).toEqual([klass?.hitDie])
    expect(character.currentHp).toBe(maxHitPoints(character))
    expect(character.featIds).toContain(background?.originFeatId)
    expect(useCharacterStore.getState().wizardDraft).toBeNull()
  })
})
