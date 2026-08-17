import {
  doc,
  collection,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Character, FeatDefinition, SpellDefinition, CustomClassDefinition } from '../types'

const charCol = (uid: string) => collection(db, 'users', uid, 'characters')
const charDocRef = (uid: string, charId: string) => doc(db, 'users', uid, 'characters', charId)
const dataDocRef = (uid: string) => doc(db, 'users', uid, 'settings', 'dataStore')

// Firestore rifiuta documenti con valori `undefined`: il round-trip JSON li rimuove ricorsivamente.
function clean<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

export async function saveCharacter(uid: string, char: Character): Promise<void> {
  await setDoc(charDocRef(uid, char.id), clean(char))
}

export async function deleteCharacterDoc(uid: string, charId: string): Promise<void> {
  await deleteDoc(charDocRef(uid, charId))
}

export async function loadCharacters(uid: string): Promise<Character[]> {
  const snap = await getDocs(charCol(uid))
  return snap.docs.map((d) => d.data() as Character)
}

export function subscribeCharacter(
  uid: string,
  charId: string,
  onUpdate: (char: Character | null) => void,
): Unsubscribe {
  return onSnapshot(charDocRef(uid, charId), (snap) => {
    onUpdate(snap.exists() ? (snap.data() as Character) : null)
  })
}

export async function saveDataStore(uid: string, data: object): Promise<void> {
  await setDoc(dataDocRef(uid), clean(data))
}

export async function loadDataStore(uid: string): Promise<Record<string, unknown> | null> {
  const snap = await getDoc(dataDocRef(uid))
  return snap.exists() ? (snap.data() as Record<string, unknown>) : null
}

const libraryCol = (type: 'feats' | 'spells' | 'classes') => collection(db, 'library', type, 'entries')
const customClassCol = (uid: string) => collection(db, 'users', uid, 'customClasses')
const customClassRef = (uid: string, classId: string) => doc(db, 'users', uid, 'customClasses', classId)
const publishedClassRef = (classId: string) => doc(db, 'library', 'classes', 'entries', classId)

export async function loadLibrary(): Promise<{ feats: FeatDefinition[]; spells: SpellDefinition[] }> {
  const [featsSnap, spellsSnap] = await Promise.all([getDocs(libraryCol('feats')), getDocs(libraryCol('spells'))])
  return {
    feats: featsSnap.docs.map((d) => d.data() as FeatDefinition),
    spells: spellsSnap.docs.map((d) => d.data() as SpellDefinition),
  }
}

/** Carica le bozze di classi custom dell'admin autore indicato. */
export async function loadCustomClasses(uid: string): Promise<CustomClassDefinition[]> {
  const snap = await getDocs(customClassCol(uid))
  return snap.docs.map((d) => d.data() as CustomClassDefinition)
}

/** Salva (crea o sovrascrive) una bozza di classe custom. */
export async function saveCustomClass(uid: string, cls: CustomClassDefinition): Promise<void> {
  await setDoc(customClassRef(uid, cls.id), clean(cls))
}

export async function deleteCustomClass(uid: string, classId: string): Promise<void> {
  await deleteDoc(customClassRef(uid, classId))
}

/**
 * Pubblica una classe custom in library/classes/entries e aggiorna lo stato della bozza.
 * Le due scritture sono indipendenti: se la seconda fallisce la bozza resta 'draft'
 * e l'utente può ripubblicare.
 */
export async function publishCustomClass(uid: string, cls: CustomClassDefinition): Promise<void> {
  const now = Date.now()
  const published: CustomClassDefinition = { ...cls, status: 'published', publishedAt: now, updatedAt: now }
  await setDoc(publishedClassRef(cls.id), clean({ ...published, publishedBy: uid, publishedAt: serverTimestamp() }))
  await setDoc(customClassRef(uid, cls.id), clean(published))
}

/** Rimuove una classe dalla libreria condivisa e riporta la bozza dell'autore a 'draft'. */
export async function withdrawCustomClass(uid: string, classId: string): Promise<void> {
  await deleteDoc(publishedClassRef(classId))
  const draftSnap = await getDoc(customClassRef(uid, classId))
  if (draftSnap.exists()) {
    const draft = draftSnap.data() as CustomClassDefinition
    await setDoc(customClassRef(uid, classId), clean({ ...draft, status: 'draft', updatedAt: Date.now() }))
  }
}

/** Sottoscrive gli aggiornamenti in tempo reale delle classi custom pubblicate. */
export function subscribePublishedClasses(onUpdate: (classes: CustomClassDefinition[]) => void): Unsubscribe {
  return onSnapshot(libraryCol('classes'), (snap) => {
    onUpdate(snap.docs.map((d) => d.data() as CustomClassDefinition))
  })
}
