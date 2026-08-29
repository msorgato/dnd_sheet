import type { BackgroundDefinition } from '../types'

export const BACKGROUNDS: BackgroundDefinition[] = [
  {
    id: 'soldato',
    name: 'Soldato',
    description: 'Hai prestato servizio in un esercito, imparando disciplina e tattica di combattimento.',
    abilityScoreOptions: ['str', 'dex', 'con'],
    skillProficiencies: ['atletica', 'intimidire'],
    toolProficiency: 'Set da giocatore',
    originFeatId: 'attaccante-selvaggio',
    equipment: ['Armatura di cuoio borchiato', 'Un\'arma da mischia semplice', 'Zaino da esploratore'],
  },
  {
    id: 'saggio',
    name: 'Saggio',
    description: 'Hai trascorso anni a studiare testi antichi e teorie arcane in una biblioteca o accademia.',
    abilityScoreOptions: ['int', 'wis', 'cha'],
    skillProficiencies: ['arcano', 'storia'],
    toolProficiency: 'Set da calligrafo',
    originFeatId: 'iniziato-alla-magia',
    equipment: ['Un libro di lore', 'Boccetta di inchiostro', 'Zaino da studioso'],
  },
  {
    id: 'criminale',
    name: 'Criminale',
    description: 'Hai vissuto ai margini della legge, sopravvivendo di astuzia e furtività.',
    abilityScoreOptions: ['dex', 'con', 'int'],
    skillProficiencies: ['rapidita-di-mano', 'furtivita'],
    toolProficiency: 'Arnesi da scasso',
    originFeatId: 'sveglio',
    equipment: ['Un\'arma da mischia semplice', 'Arnesi da scasso', 'Zaino da criminale'],
  },
]

export function getBackground(id: string): BackgroundDefinition | undefined {
  return BACKGROUNDS.find((background) => background.id === id)
}
