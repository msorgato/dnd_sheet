export type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'

export type AbilityScores = Record<AbilityKey, number>

export type FeatCategory = 'origin' | 'general' | 'fighting-style' | 'epic-boon'

export type SpellcastingType = 'prepared' | 'known'

export interface SkillDefinition {
  id: string
  name: string
  ability: AbilityKey
}

export interface FeatDefinition {
  id: string
  name: string
  description: string
  category: FeatCategory
  prerequisites?: string
  benefit: string
  repeatable?: boolean
}

export interface BackgroundDefinition {
  id: string
  name: string
  description: string
  /** Le regole D&D 2024 legano il bonus di caratteristica al background, non più alla specie. */
  abilityScoreOptions: AbilityKey[]
  skillProficiencies: string[]
  toolProficiency?: string
  /** Talento di origine assegnato automaticamente da questo background. */
  originFeatId: string
  equipment: string[]
}

export interface SpeciesTrait {
  name: string
  description: string
}

export interface SpeciesDefinition {
  id: string
  name: string
  description: string
  size: 'Small' | 'Medium'
  speed: number
  traits: SpeciesTrait[]
  resistances?: string[]
  languages: string[]
}

export interface ClassFeatureChoice {
  id: string
  name: string
  description: string
}

export interface ClassFeature {
  level: number
  name: string
  description: string
  choices?: ClassFeatureChoice[]
}

export interface SpellcastingDefinition {
  ability: AbilityKey
  type: SpellcastingType
  cantripsKnown?: number[]
  /** Slot per livello incantesimo (indice 0 = livello 1), per livello personaggio (indice 0 = livello 1 personaggio). */
  slotsByCharacterLevel: number[][]
  spellList: string[]
}

export interface ClassDefinition {
  id: string
  name: string
  description: string
  hitDie: 6 | 8 | 10 | 12
  /** In D&D 2024 le classi garantiscono competenza su esattamente 2 delle 6 caratteristiche per i tiri salvezza. */
  savingThrowProficiencies: [AbilityKey, AbilityKey]
  skillChoices: {
    count: number
    from: string[]
  }
  armorProficiencies: string[]
  weaponProficiencies: string[]
  toolProficiencies?: string[]
  features: ClassFeature[]
  spellcasting?: SpellcastingDefinition
}

export interface SpellDefinition {
  id: string
  name: string
  level: number
  school: string
  castingTime: string
  range: string
  components: string
  duration: string
  description: string
  classes: string[]
}

export type CustomClassStatus = 'draft' | 'published'

export interface CustomClassDefinition extends Omit<ClassDefinition, 'features'> {
  authorId: string
  status: CustomClassStatus
  createdAt: number
  updatedAt: number
  publishedAt?: number
  publishedBy?: string
  /** Le funzionalità di una classe custom sono definite come dati liberi per livello, non da un modulo TS statico. */
  featuresByLevel: Record<number, ClassFeature[]>
}

export interface CharacterClassEntry {
  classId: string
  level: number
}

export interface KnownSpell {
  spellId: string
  classId: string
}

export interface PreparedSpell {
  spellId: string
  classId: string
}

export interface SpellSlotUsage {
  classId: string
  spellLevel: number
  used: number
}

export interface EquipmentItem {
  id: string
  name: string
  quantity: number
  notes?: string
}

export interface Character {
  id: string
  name: string
  speciesId: string
  backgroundId: string
  classes: CharacterClassEntry[]
  totalLevel: number
  baseAbilityScores: AbilityScores
  /** Bonus di caratteristica scelto in base al background (regole D&D 2024). */
  backgroundAbilityBonus: Partial<AbilityScores>
  skillProficiencies: string[]
  skillExpertise: string[]
  featIds: string[]
  hitPointsRolled: number[]
  currentHp: number
  tempHp: number
  knownSpells: KnownSpell[]
  preparedSpells: PreparedSpell[]
  spellSlots: SpellSlotUsage[]
  equipment: EquipmentItem[]
  notes: string
}

export interface Lobby {
  id: string
  code: string
  name: string
  ownerId: string
  ownerName: string
  createdAt: number
  isActive: boolean
  gmUid?: string
}

export interface LobbyMember {
  userId: string
  displayName: string
  joinedAt: number
  lastSeenAt: number
  characterId?: string
}

export interface RollResultData {
  characterName: string
  label: string
  formula: string
  rolls: number[]
  modifier: number
  total: number
  isCrit?: boolean
  isFumble?: boolean
}

export interface LobbyMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  sentAt: number
  type?: 'text' | 'roll'
  rollData?: RollResultData
  hidden?: boolean
}

export interface LobbyWithUnread extends Lobby {
  unreadCount: number
  memberCount: number
}
