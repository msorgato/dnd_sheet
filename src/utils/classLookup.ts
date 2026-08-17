import { getClass } from '../data/classes'
import { useDataStore } from '../store/dataStore'
import type { ClassDefinition, ClassFeature, CustomClassDefinition } from '../types'

function toClassDefinition(cls: CustomClassDefinition): ClassDefinition {
  const features: ClassFeature[] = Object.values(cls.featuresByLevel).flat()
  return { ...cls, features }
}

/**
 * Risolve un classId sia tra le classi built-in sia tra le classi custom
 * (bozza dell'autore o pubblicata in libreria), normalizzando la forma dati.
 */
export function resolveClass(classId: string): ClassDefinition | undefined {
  const builtin = getClass(classId)
  if (builtin) return builtin
  const { customClasses, publishedCustomClasses } = useDataStore.getState()
  const custom = publishedCustomClasses.find((c) => c.id === classId) ?? customClasses.find((c) => c.id === classId)
  return custom ? toClassDefinition(custom) : undefined
}
