import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCharacterStore } from '../store/characterStore'
import { getBackground } from '../data/backgrounds'
import { Step1_Species } from '../components/wizard/Step1_Species'
import { Step2_Class } from '../components/wizard/Step2_Class'
import { Step3_Background } from '../components/wizard/Step3_Background'
import { Step4_AbilityScores } from '../components/wizard/Step4_AbilityScores'
import { Step5_Skills } from '../components/wizard/Step5_Skills'
import { Step6_Details } from '../components/wizard/Step6_Details'
import type { AbilityKey, AbilityScores } from '../types'

const EMPTY_SCORES: AbilityScores = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 }

export function CharacterWizard() {
  const navigate = useNavigate()
  const { setWizardDraft, updateWizardDraft, commitWizardDraft } = useCharacterStore()

  const [step, setStep] = useState(1)
  const [speciesId, setSpeciesId] = useState('')
  const [classId, setClassId] = useState('')
  const [backgroundId, setBackgroundId] = useState('')
  const [backgroundAbilityBonus, setBackgroundAbilityBonus] = useState<Partial<Record<AbilityKey, number>>>({})
  const [baseAbilityScores, setBaseAbilityScores] = useState<AbilityScores>(EMPTY_SCORES)
  const [skillProficiencies, setSkillProficiencies] = useState<string[]>([])
  const [name, setName] = useState('')

  const goTo = (n: number) => setStep(n)

  const finish = () => {
    const background = getBackground(backgroundId)
    const allSkills = [...new Set([...(background?.skillProficiencies ?? []), ...skillProficiencies])]
    const equipment = (background?.equipment ?? []).map((name) => ({
      id: `${Math.random().toString(36).slice(2)}`,
      name,
      quantity: 1,
    }))

    setWizardDraft({})
    updateWizardDraft({
      name,
      speciesId,
      backgroundId,
      classes: [{ classId, level: 1 }],
      baseAbilityScores,
      backgroundAbilityBonus,
      skillProficiencies: allSkills,
      featIds: background ? [background.originFeatId] : [],
      equipment,
    })
    const id = commitWizardDraft()
    if (id) navigate(`/character/${id}`)
  }

  if (step === 1) {
    return <Step1_Species selectedSpeciesId={speciesId} onSelect={setSpeciesId} onNext={() => goTo(2)} />
  }
  if (step === 2) {
    return (
      <Step2_Class selectedClassId={classId} onSelect={setClassId} onNext={() => goTo(3)} onBack={() => goTo(1)} />
    )
  }
  if (step === 3) {
    return (
      <Step3_Background
        selectedBackgroundId={backgroundId}
        abilityBonus={backgroundAbilityBonus}
        onSelect={(id, bonus) => {
          setBackgroundId(id)
          setBackgroundAbilityBonus(bonus)
        }}
        onNext={() => goTo(4)}
        onBack={() => goTo(2)}
      />
    )
  }
  if (step === 4) {
    return (
      <Step4_AbilityScores
        scores={baseAbilityScores}
        onChange={setBaseAbilityScores}
        onNext={() => goTo(5)}
        onBack={() => goTo(3)}
      />
    )
  }
  if (step === 5) {
    return (
      <Step5_Skills
        classId={classId}
        backgroundId={backgroundId}
        selectedSkillIds={skillProficiencies}
        onChange={setSkillProficiencies}
        onNext={() => goTo(6)}
        onBack={() => goTo(4)}
      />
    )
  }

  return (
    <Step6_Details
      name={name}
      speciesId={speciesId}
      classId={classId}
      backgroundId={backgroundId}
      onNameChange={setName}
      onFinish={finish}
      onBack={() => goTo(5)}
    />
  )
}
