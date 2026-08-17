import type { ClassDefinition } from '../../types'

export const WIZARD: ClassDefinition = {
  id: 'mago',
  name: 'Mago',
  description: 'Uno studioso della magia arcana, che piega la realtà attraverso lo studio e la disciplina.',
  hitDie: 6,
  savingThrowProficiencies: ['int', 'wis'],
  skillChoices: {
    count: 2,
    from: ['arcano', 'storia', 'intuizione', 'indagare', 'medicina', 'religione'],
  },
  armorProficiencies: [],
  weaponProficiencies: ['Semplici'],
  features: [
    {
      level: 1,
      name: 'Libro degli Incantesimi',
      description: 'Possiedi un libro degli incantesimi contenente gli incantesimi che conosci.',
    },
    {
      level: 1,
      name: 'Recupero Arcano',
      description: 'Una volta al giorno, dopo un riposo breve, puoi recuperare slot incantesimo spesi per un totale di livelli pari alla metà del tuo livello da mago (arrotondato per eccesso).',
    },
    {
      level: 2,
      name: 'Tradizione Arcana',
      description: 'Scegli una tradizione arcana che orienta i tuoi studi.',
      choices: [
        { id: 'scuola-di-evocazione', name: 'Scuola di Evocazione', description: 'I tuoi incantesimi di evocazione infliggono danni aggiuntivi.' },
      ],
    },
  ],
  spellcasting: {
    ability: 'int',
    type: 'prepared',
    cantripsKnown: [3, 3, 3],
    slotsByCharacterLevel: [[2], [3], [4, 2]],
    spellList: ['luce', 'scudo', 'dardo-incantato', 'palla-di-fuoco'],
  },
}
