import {
  doc,
  collection,
  addDoc,
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
const auditLogCol = () => collection(db, 'audit_log')

type AuditAction = 'library.created' | 'library.updated' | 'library.deleted' | 'account.deleted'

/**
 * Scrive una voce di audit log (regole Firestore: solo create, mai update/delete,
 * performedBy deve coincidere con l'autore della richiesta, timestamp forzato al server).
 * Scrittura indipendente e best-effort: se fallisce non blocca l'azione principale già eseguita.
 */
async function writeAuditLog(entry: {
  action: AuditAction
  performedBy: string
  targetId: string
  targetCollection?: string
}): Promise<void> {
  // `timestamp` deve restare il sentinel FieldValue: un round-trip clean() lo trasformerebbe
  // in un oggetto letterale e le regole (che richiedono timestamp == request.time) rifiuterebbero la scrittura.
  await addDoc(auditLogCol(), { ...clean(entry), timestamp: serverTimestamp() })
}

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
 * Le scritture sono indipendenti: se una fallisce dopo la pubblicazione, la bozza/l'audit
 * possono restare disallineati e l'utente può ripubblicare.
 */
export async function publishCustomClass(uid: string, cls: CustomClassDefinition): Promise<void> {
  const now = Date.now()
  const published: CustomClassDefinition = { ...cls, status: 'published', publishedAt: now, updatedAt: now }
  const alreadyPublished = (await getDoc(publishedClassRef(cls.id))).exists()
  // `publishedAt` deve restare il sentinel serverTimestamp(): va applicato dopo clean(),
  // altrimenti il round-trip JSON lo trasforma in un oggetto letterale non riconosciuto da Firestore.
  await setDoc(publishedClassRef(cls.id), { ...clean({ ...published, publishedBy: uid }), publishedAt: serverTimestamp() })
  await setDoc(customClassRef(uid, cls.id), clean(published))
  await writeAuditLog({
    action: alreadyPublished ? 'library.updated' : 'library.created',
    performedBy: uid,
    targetId: cls.id,
    targetCollection: 'classes',
  })
}

/** Rimuove una classe dalla libreria condivisa e riporta la bozza dell'autore a 'draft'. */
export async function withdrawCustomClass(uid: string, classId: string): Promise<void> {
  await deleteDoc(publishedClassRef(classId))
  const draftSnap = await getDoc(customClassRef(uid, classId))
  if (draftSnap.exists()) {
    const draft = draftSnap.data() as CustomClassDefinition
    await setDoc(customClassRef(uid, classId), clean({ ...draft, status: 'draft', updatedAt: Date.now() }))
  }
  await writeAuditLog({ action: 'library.deleted', performedBy: uid, targetId: classId, targetCollection: 'classes' })
}

/** Cancella personaggi, classi custom e impostazioni dell'utente (fase 1 della cancellazione account). */
export async function deleteAllUserData(uid: string): Promise<void> {
  const [charSnap, classSnap] = await Promise.all([getDocs(charCol(uid)), getDocs(customClassCol(uid))])
  await Promise.all([
    ...charSnap.docs.map((d) => deleteDoc(d.ref)),
    ...classSnap.docs.map((d) => deleteDoc(d.ref)),
    deleteDoc(doc(db, 'users', uid, 'settings', 'profile')),
    deleteDoc(dataDocRef(uid)),
  ])
}

/** Registra nell'audit log l'autocancellazione dell'account (azione ammessa solo su se stessi). */
export async function writeAccountDeletedAuditLog(uid: string): Promise<void> {
  await writeAuditLog({ action: 'account.deleted', performedBy: uid, targetId: uid })
}

/** Sottoscrive gli aggiornamenti in tempo reale delle classi custom pubblicate. */
export function subscribePublishedClasses(onUpdate: (classes: CustomClassDefinition[]) => void): Unsubscribe {
  return onSnapshot(libraryCol('classes'), (snap) => {
    onUpdate(snap.docs.map((d) => d.data() as CustomClassDefinition))
  })
}
