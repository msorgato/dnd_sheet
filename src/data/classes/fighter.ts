import type { ClassDefinition } from '../../types'

export const FIGHTER: ClassDefinition = {
  id: 'guerriero',
  name: 'Guerriero',
  description: 'Un maestro delle armi e delle tattiche di combattimento, capace di adattarsi a qualunque scontro.',
  hitDie: 10,
  savingThrowProficiencies: ['str', 'con'],
  skillChoices: {
    count: 2,
    from: [
      'atletica',
      'acrobazia',
      'addestrare-animali',
      'storia',
      'intuizione',
      'intimidire',
      'percezione',
      'sopravvivenza',
    ],
  },
  armorProficiencies: ['Leggera', 'Media', 'Pesante', 'Scudi'],
  weaponProficiencies: ['Semplici', 'Da guerra'],
  features: [
    {
      level: 1,
      name: 'Stile di Combattimento',
      description: 'Scegli uno stile di combattimento che riflette la tua specializzazione.',
      choices: [
        { id: 'difesa', name: 'Difesa', description: 'Finché indossi un\'armatura, ottieni +1 alla CA.' },
        { id: 'arma-a-due-mani', name: 'Combattimento con Arma a Due Mani', description: 'Puoi ritirare i risultati di 1 o 2 sui dadi danno delle armi a due mani impugnate a due mani.' },
      ],
    },
    {
      level: 1,
      name: 'Recupero Energie',
      description: 'Come azione bonus, recuperi punti ferita pari a 1d10 + il tuo livello da guerriero. Puoi usarlo una volta per riposo breve o lungo.',
    },
    {
      level: 2,
      name: 'Azione Impetuosa',
      description: 'Una volta per riposo breve o lungo, puoi intraprendere un\'azione aggiuntiva nel tuo turno.',
    },
    {
      level: 3,
      name: 'Archetipo Marziale',
      description: 'Scegli un archetipo che modella le tue tecniche di combattimento.',
      choices: [
        { id: 'campione', name: 'Campione', description: 'I tuoi colpi critici avvengono con un tiro naturale di 19 o 20.' },
      ],
    },
  ],
}
