import { getBackground } from '../../data/backgrounds'
import { getSkill } from '../../data/skills'
import { resolveClass } from '../../utils/classLookup'
import { WizardLayout } from './WizardLayout'

interface Props {
  classId: string
  backgroundId: string
  selectedSkillIds: string[]
  onChange: (skillIds: string[]) => void
  onNext: () => void
  onBack: () => void
}

export function Step5_Skills({ classId, backgroundId, selectedSkillIds, onChange, onNext, onBack }: Props) {
  const klass = resolveClass(classId)
  const background = getBackground(backgroundId)
  const backgroundSkills = background?.skillProficiencies ?? []
  const choices = klass?.skillChoices
  const selectableSkills = (choices?.from ?? []).filter((id) => !backgroundSkills.includes(id))
  const count = choices?.count ?? 0

  const toggle = (skillId: string) => {
    if (selectedSkillIds.includes(skillId)) {
      onChange(selectedSkillIds.filter((id) => id !== skillId))
      return
    }
    if (selectedSkillIds.length >= count) return
    onChange([...selectedSkillIds, skillId])
  }

  const canProceed = selectedSkillIds.length === count

  return (
    <WizardLayout step={5} title="Scegli le tue Competenze" onBack={onBack} onNext={onNext} nextDisabled={!canProceed}>
      <p className="mb-4 text-sm text-[var(--theme-text-soft)]">
        Competenze già garantite dal background: {backgroundSkills.map((id) => getSkill(id)?.name ?? id).join(', ') || 'nessuna'}.
      </p>
      <p className="mb-4 text-sm text-[var(--theme-text-soft)]">
        Scegli {count} competenze di classe ({selectedSkillIds.length}/{count} selezionate).
      </p>
      <div className="grid grid-cols-2 gap-2">
        {selectableSkills.map((skillId) => {
          const skill = getSkill(skillId)
          if (!skill) return null
          const selected = selectedSkillIds.includes(skillId)
          return (
            <button
              key={skillId}
              onClick={() => toggle(skillId)}
              className="rounded-md border px-3 py-2 text-left text-sm"
              style={{
                borderColor: selected ? 'var(--theme-accent)' : 'var(--theme-border)',
                background: selected ? 'var(--theme-accent)' : 'var(--theme-surface)',
                color: selected ? 'white' : 'var(--theme-text)',
              }}
            >
              {skill.name}
            </button>
          )
        })}
      </div>
    </WizardLayout>
  )
}
