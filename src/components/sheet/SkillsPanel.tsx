import { SKILLS } from '../../data/skills'
import type { AbilityScores } from '../../types'
import { skillBonus } from '../../utils/calculations'

interface Props {
  scores: AbilityScores
  level: number
  proficientSkillIds: string[]
}

export function SkillsPanel({ scores, level, proficientSkillIds }: Props) {
  return (
    <div className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[var(--theme-text-mute)]">Competenze</h3>
      <div className="space-y-1">
        {SKILLS.map((skill) => {
          const proficient = proficientSkillIds.includes(skill.id)
          const bonus = skillBonus(scores, skill.ability, level, proficient)
          return (
            <div key={skill.id} className="flex items-center justify-between text-sm">
              <span className={proficient ? 'text-[var(--theme-text)]' : 'text-[var(--theme-text-mute)]'}>
                {proficient && <span className="mr-1 text-[var(--theme-accent-bright)]">•</span>}
                {skill.name}
              </span>
              <span className="text-[var(--theme-text-soft)]">
                {bonus >= 0 ? '+' : ''}
                {bonus}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
