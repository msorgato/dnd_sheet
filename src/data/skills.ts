import type { SkillDefinition } from '../types'

export const SKILLS: SkillDefinition[] = [
  { id: 'acrobazia', name: 'Acrobazia', ability: 'dex' },
  { id: 'addestrare-animali', name: 'Addestrare Animali', ability: 'wis' },
  { id: 'arcano', name: 'Arcano', ability: 'int' },
  { id: 'atletica', name: 'Atletica', ability: 'str' },
  { id: 'furtivita', name: 'Furtività', ability: 'dex' },
  { id: 'indagare', name: 'Indagare', ability: 'int' },
  { id: 'inganno', name: 'Inganno', ability: 'cha' },
  { id: 'intimidire', name: 'Intimidire', ability: 'cha' },
  { id: 'intrattenere', name: 'Intrattenere', ability: 'cha' },
  { id: 'intuizione', name: 'Intuizione', ability: 'wis' },
  { id: 'medicina', name: 'Medicina', ability: 'wis' },
  { id: 'natura', name: 'Natura', ability: 'int' },
  { id: 'percezione', name: 'Percezione', ability: 'wis' },
  { id: 'persuasione', name: 'Persuasione', ability: 'cha' },
  { id: 'rapidita-di-mano', name: 'Rapidità di Mano', ability: 'dex' },
  { id: 'religione', name: 'Religione', ability: 'int' },
  { id: 'sopravvivenza', name: 'Sopravvivenza', ability: 'wis' },
  { id: 'storia', name: 'Storia', ability: 'int' },
]

export function getSkill(id: string): SkillDefinition | undefined {
  return SKILLS.find((skill) => skill.id === id)
}
