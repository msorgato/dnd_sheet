import type { SpellDefinition } from '../types'

/**
 * Gli incantesimi built-in vengono caricati a runtime da `public/data/spells.json`
 * (vedi `dataStore.loadBuiltinData`), non inclusi qui come modulo statico.
 */
export const SPELLS: SpellDefinition[] = []
