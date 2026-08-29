import type { FeatDefinition } from '../types'

/**
 * I talenti built-in vengono caricati a runtime da `public/data/feats.json`
 * (vedi `dataStore.loadBuiltinData`), non inclusi qui come modulo statico.
 */
export const FEATS: FeatDefinition[] = []
