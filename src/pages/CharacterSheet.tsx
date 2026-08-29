import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCharacterStore } from '../store/characterStore'
import { getSpecies } from '../data/species'
import { getBackground } from '../data/backgrounds'
import { effectiveAbilityScores, maxHitPoints } from '../utils/calculations'
import { resolveClass } from '../utils/classLookup'
import { AbilityPanel } from '../components/sheet/AbilityPanel'
import { CombatStats } from '../components/sheet/CombatStats'
import { SkillsPanel } from '../components/sheet/SkillsPanel'
import { FeaturesPanel } from '../components/sheet/FeaturesPanel'
import { SpellsPanel } from '../components/sheet/SpellsPanel'
import { EquipmentPanel } from '../components/sheet/EquipmentPanel'
import { LevelUpWizard } from '../components/levelup/LevelUpWizard'

export function CharacterSheet() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const characters = useCharacterStore((s) => s.characters)
  const { takeDamage, heal, setTempHp, fullRest, levelUp, expendSpellSlot } = useCharacterStore()
  const [showLevelUp, setShowLevelUp] = useState(false)

  const character = characters.find((c) => c.id === id)

  if (!character) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--theme-bg)] text-[var(--theme-text)]">
        <p>Personaggio non trovato.</p>
      </div>
    )
  }

  const species = getSpecies(character.speciesId)
  const background = getBackground(character.backgroundId)
  const scores = effectiveAbilityScores(character)
  const maxHp = maxHitPoints(character)
  const primaryClass = resolveClass(character.classes[0]?.classId ?? '')
  const savingThrowProficiencies = primaryClass?.savingThrowProficiencies ?? (['str', 'con'] as const)

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] pb-10">
      <header className="flex items-center justify-between border-b border-[var(--theme-border)] px-6 py-4">
        <div>
          <button className="text-sm text-[var(--theme-text-mute)] hover:text-[var(--theme-text)]" onClick={() => navigate('/')}>
            ← Torna ai personaggi
          </button>
          <h1 className="mt-1 text-2xl font-bold text-[var(--theme-text)]">{character.name}</h1>
          <p className="text-sm text-[var(--theme-text-mute)]">
            {species?.name} · {primaryClass?.name} liv. {character.totalLevel} · {background?.name}
          </p>
        </div>
        <button
          className="rounded-md bg-[var(--theme-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--theme-accent-bright)]"
          onClick={() => setShowLevelUp(true)}
        >
          Sali di livello
        </button>
      </header>

      <main className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-6 py-6 md:grid-cols-2">
        <AbilityPanel scores={scores} savingThrowProficiencies={[...savingThrowProficiencies]} level={character.totalLevel} />
        <CombatStats
          scores={scores}
          level={character.totalLevel}
          currentHp={character.currentHp}
          maxHp={maxHp}
          tempHp={character.tempHp}
          onDamage={(amount) => takeDamage(character.id, amount)}
          onHeal={(amount) => heal(character.id, amount)}
          onSetTempHp={(amount) => setTempHp(character.id, amount)}
          onFullRest={() => fullRest(character.id)}
        />
        <SkillsPanel scores={scores} level={character.totalLevel} proficientSkillIds={character.skillProficiencies} />
        <FeaturesPanel classes={character.classes} speciesId={character.speciesId} featIds={character.featIds} />
        <EquipmentPanel equipment={character.equipment} />
        <div className="md:col-span-2">
          <SpellsPanel
            classes={character.classes}
            preparedSpells={character.preparedSpells}
            spellSlots={character.spellSlots}
            onUseSlot={(classId, spellLevel) => expendSpellSlot(character.id, classId, spellLevel)}
          />
        </div>
      </main>

      {showLevelUp && (
        <LevelUpWizard
          classes={character.classes}
          currentLevel={character.totalLevel}
          onConfirm={(classId, hpRoll) => {
            levelUp(character.id, classId, hpRoll)
            setShowLevelUp(false)
          }}
          onCancel={() => setShowLevelUp(false)}
        />
      )}
    </div>
  )
}
