import type { SpeciesDefinition } from '../types'

export const SPECIES: SpeciesDefinition[] = [
  {
    id: 'umano',
    name: 'Umano',
    description:
      'Versatili e ambiziosi, gli umani sono la specie più diffusa nei regni conosciuti.',
    size: 'Medium',
    speed: 30,
    traits: [
      {
        name: 'Ingegnoso',
        description:
          'Puoi ottenere un punto Ispirazione Eroica ogni volta che finisci un riposo lungo, se non ne hai già uno.',
      },
      {
        name: 'Abile',
        description: 'Ottieni competenza in una competenza a tua scelta.',
      },
      {
        name: 'Versatile',
        description: 'Ottieni un talento di origine a tua scelta.',
      },
    ],
    languages: ['Comune'],
  },
  {
    id: 'elfo',
    name: 'Elfo',
    description:
      'Longevi e magicamente sensibili, gli elfi coltivano l\'arte e la maestria per secoli.',
    size: 'Medium',
    speed: 30,
    traits: [
      {
        name: 'Scurovisione',
        description: 'Puoi vedere al buio entro 18 metri come se fosse penombra.',
      },
      {
        name: 'Ascendenza Fatata',
        description: 'Hai vantaggio ai tiri salvezza per non essere affascinato e non puoi essere addormentato magicamente.',
      },
      {
        name: 'Trance',
        description: 'Non hai bisogno di dormire e puoi finire un riposo lungo in 4 ore rimanendo semi-cosciente.',
      },
    ],
    resistances: [],
    languages: ['Comune', 'Elfico'],
  },
]

export function getSpecies(id: string): SpeciesDefinition | undefined {
  return SPECIES.find((species) => species.id === id)
}
