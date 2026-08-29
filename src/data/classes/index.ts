import type { ClassDefinition } from '../../types'
import { FIGHTER } from './fighter'
import { WIZARD } from './wizard'

export const CLASSES: ClassDefinition[] = [FIGHTER, WIZARD]

export function getClass(id: string): ClassDefinition | undefined {
  return CLASSES.find((klass) => klass.id === id)
}
