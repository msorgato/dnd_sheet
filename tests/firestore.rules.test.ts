/**
 * Test delle regole di sicurezza Firestore (capability firestore-security-rules e account-data-rights).
 *
 * Richiede l'emulatore Firestore attivo prima dell'esecuzione:
 *   firebase emulators:start --only firestore
 *
 * Esecuzione:
 *   npm run test:rules
 */

import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest'
import { initializeTestEnvironment, assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { setDoc, getDoc, getDocs, addDoc, updateDoc, doc, collection, serverTimestamp, Timestamp } from 'firebase/firestore'

const PROJECT_ID = 'dnd-sheet-test'

let testEnv: RulesTestEnvironment

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync(resolve(__dirname, '../firestore.rules'), 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  })
})

afterAll(async () => {
  await testEnv.cleanup()
})

beforeEach(async () => {
  await testEnv.clearFirestore()
})

async function setupAdminUser(uid: string): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'users', uid, 'settings', 'profile'), { role: 'admin' })
  })
}

async function setupLobby(lobbyId: string, ownerId: string): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore()
    await setDoc(doc(db, 'lobbies', lobbyId), { code: 'ABCD', ownerId, isActive: true })
    await setDoc(doc(db, 'lobbies', lobbyId, 'members', ownerId), {
      userId: ownerId,
      displayName: 'Owner',
      joinedAt: new Date(),
    })
  })
}

describe('Isolamento dei dati privati per utente', () => {
  it('un utente può leggere e scrivere i propri dati sotto users/{uid}', async () => {
    const user = testEnv.authenticatedContext('user-1')
    await assertSucceeds(setDoc(doc(user.firestore(), 'users', 'user-1', 'characters', 'char-1'), { name: 'Aldric' }))
    await assertSucceeds(getDoc(doc(user.firestore(), 'users', 'user-1', 'characters', 'char-1')))
  })

  it('un utente non può leggere i dati di un altro utente', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users', 'other-uid', 'characters', 'char-1'), { name: 'Segreto' })
    })
    const user = testEnv.authenticatedContext('user-1')
    await assertFails(getDoc(doc(user.firestore(), 'users', 'other-uid', 'characters', 'char-1')))
  })

  it('un utente non può scrivere nei dati di un altro utente', async () => {
    const user = testEnv.authenticatedContext('user-1')
    await assertFails(setDoc(doc(user.firestore(), 'users', 'other-uid', 'characters', 'char-1'), { name: 'Intruso' }))
  })

  it('un utente non autenticato non può leggere né scrivere dati utente', async () => {
    const anon = testEnv.unauthenticatedContext()
    await assertFails(getDoc(doc(anon.firestore(), 'users', 'user-1', 'characters', 'char-1')))
    await assertFails(setDoc(doc(anon.firestore(), 'users', 'user-1', 'characters', 'char-1'), { name: 'Anonimo' }))
  })
})

describe('Libreria condivisa — lettura pubblica, scrittura solo admin', () => {
  const classData = { id: 'guerriero-custom', name: 'Guerriero Custom', hitDie: 10 }

  it('un utente autenticato non admin può leggere ma non scrivere in libreria', async () => {
    const user = testEnv.authenticatedContext('user-regular')
    await assertSucceeds(getDocs(collection(user.firestore(), 'library', 'classes', 'entries')))
    await assertFails(setDoc(doc(user.firestore(), 'library', 'classes', 'entries', 'guerriero-custom'), classData))
  })

  it('un utente non autenticato può leggere ma non scrivere in libreria', async () => {
    const anon = testEnv.unauthenticatedContext()
    await assertSucceeds(getDocs(collection(anon.firestore(), 'library', 'classes', 'entries')))
    await assertFails(setDoc(doc(anon.firestore(), 'library', 'classes', 'entries', 'guerriero-custom'), classData))
  })

  it('un utente admin può scrivere in libreria', async () => {
    const adminUid = 'admin-user'
    await setupAdminUser(adminUid)
    const admin = testEnv.authenticatedContext(adminUid)
    await assertSucceeds(setDoc(doc(admin.firestore(), 'library', 'classes', 'entries', 'guerriero-custom'), classData))
  })
})

describe('Lobby — accesso basato sull\'appartenenza', () => {
  it('un utente autenticato non membro può elencare le lobby (necessario per l\'adesione tramite codice)', async () => {
    await setupLobby('lobby-1', 'owner-1')
    const user = testEnv.authenticatedContext('stranger')
    await assertSucceeds(getDocs(collection(user.firestore(), 'lobbies')))
  })

  it('un utente non autenticato non può elencare le lobby', async () => {
    const anon = testEnv.unauthenticatedContext()
    await assertFails(getDocs(collection(anon.firestore(), 'lobbies')))
  })

  it('un utente autenticato non membro non può leggere il documento di una lobby specifica', async () => {
    await setupLobby('lobby-1', 'owner-1')
    const user = testEnv.authenticatedContext('stranger')
    await assertFails(getDoc(doc(user.firestore(), 'lobbies', 'lobby-1')))
  })

  it('un membro della lobby può leggere il documento della propria lobby', async () => {
    const memberUid = 'member-1'
    await setupLobby('lobby-1', memberUid)
    const user = testEnv.authenticatedContext(memberUid)
    await assertSucceeds(getDoc(doc(user.firestore(), 'lobbies', 'lobby-1')))
  })

  it('un utente esterno alla lobby non può leggerne i messaggi', async () => {
    await setupLobby('lobby-1', 'owner-1')
    const stranger = testEnv.authenticatedContext('stranger')
    await assertFails(getDocs(collection(stranger.firestore(), 'lobbies', 'lobby-1', 'messages')))
  })

  it('un membro della lobby può leggerne i messaggi', async () => {
    const memberUid = 'member-1'
    await setupLobby('lobby-1', memberUid)
    const user = testEnv.authenticatedContext(memberUid)
    await assertSucceeds(getDocs(collection(user.firestore(), 'lobbies', 'lobby-1', 'messages')))
  })

  it('un membro può inviare un messaggio in una lobby attiva', async () => {
    const memberUid = 'member-1'
    await setupLobby('lobby-1', memberUid)
    const user = testEnv.authenticatedContext(memberUid)
    await assertSucceeds(
      addDoc(collection(user.firestore(), 'lobbies', 'lobby-1', 'messages'), {
        senderId: memberUid,
        content: 'Ciao a tutti',
        sentAt: new Date(),
      }),
    )
  })

  it('un utente non membro non può inviare messaggi', async () => {
    await setupLobby('lobby-1', 'owner-1')
    const stranger = testEnv.authenticatedContext('stranger')
    await assertFails(
      addDoc(collection(stranger.firestore(), 'lobbies', 'lobby-1', 'messages'), {
        senderId: 'stranger',
        content: 'Intrusione',
        sentAt: new Date(),
      }),
    )
  })
})

describe('Audit log — lettura solo admin, scrittura create-only con schema validato', () => {
  it('un utente admin può leggere l\'audit log', async () => {
    const adminUid = 'admin-user'
    await setupAdminUser(adminUid)
    const admin = testEnv.authenticatedContext(adminUid)
    await assertSucceeds(getDocs(collection(admin.firestore(), 'audit_log')))
  })

  it('un utente non admin non può leggere l\'audit log', async () => {
    const user = testEnv.authenticatedContext('user-regular')
    await assertFails(getDocs(collection(user.firestore(), 'audit_log')))
  })

  it('un admin può registrare un\'azione di libreria su se stesso, con timestamp del server', async () => {
    const adminUid = 'admin-user'
    await setupAdminUser(adminUid)
    const admin = testEnv.authenticatedContext(adminUid)
    await assertSucceeds(
      addDoc(collection(admin.firestore(), 'audit_log'), {
        action: 'library.created',
        performedBy: adminUid,
        targetId: 'classe-1',
        targetCollection: 'classes',
        timestamp: serverTimestamp(),
      }),
    )
  })

  it('un admin non può impersonare un altro admin come performedBy', async () => {
    const adminUid = 'admin-user'
    await setupAdminUser(adminUid)
    const admin = testEnv.authenticatedContext(adminUid)
    await assertFails(
      addDoc(collection(admin.firestore(), 'audit_log'), {
        action: 'library.created',
        performedBy: 'altro-admin',
        targetId: 'classe-1',
        timestamp: serverTimestamp(),
      }),
    )
  })

  it('un utente non admin non può registrare azioni di libreria', async () => {
    const user = testEnv.authenticatedContext('user-regular')
    await assertFails(
      addDoc(collection(user.firestore(), 'audit_log'), {
        action: 'library.created',
        performedBy: 'user-regular',
        targetId: 'classe-1',
        timestamp: serverTimestamp(),
      }),
    )
  })

  it('un utente qualsiasi può registrare la cancellazione del proprio account', async () => {
    const user = testEnv.authenticatedContext('user-regular')
    await assertSucceeds(
      addDoc(collection(user.firestore(), 'audit_log'), {
        action: 'account.deleted',
        performedBy: 'user-regular',
        targetId: 'user-regular',
        timestamp: serverTimestamp(),
      }),
    )
  })

  it('un utente non può registrare la cancellazione dell\'account di un altro', async () => {
    const user = testEnv.authenticatedContext('user-regular')
    await assertFails(
      addDoc(collection(user.firestore(), 'audit_log'), {
        action: 'account.deleted',
        performedBy: 'user-regular',
        targetId: 'altro-utente',
        timestamp: serverTimestamp(),
      }),
    )
  })

  it('un timestamp non generato dal server viene rifiutato', async () => {
    const adminUid = 'admin-user'
    await setupAdminUser(adminUid)
    const admin = testEnv.authenticatedContext(adminUid)
    await assertFails(
      addDoc(collection(admin.firestore(), 'audit_log'), {
        action: 'library.created',
        performedBy: adminUid,
        targetId: 'classe-1',
        timestamp: new Date(),
      }),
    )
  })

  it('nessun client, admin incluso, può modificare o eliminare una voce di audit log', async () => {
    const adminUid = 'admin-user'
    await setupAdminUser(adminUid)
    const admin = testEnv.authenticatedContext(adminUid)
    const ref = doc(admin.firestore(), 'audit_log', 'entry-1')
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'audit_log', 'entry-1'), {
        action: 'library.created',
        performedBy: adminUid,
        targetId: 'classe-1',
        timestamp: Timestamp.now(),
      })
    })
    await assertFails(updateDoc(ref, { action: 'library.deleted' }))
    await assertFails(setDoc(ref, { action: 'library.deleted' }, { merge: true }))
  })
})

describe('Anti-flood chat — limite basato sul contatore del member doc', () => {
  it('il primo messaggio di un membro (senza contatore pregresso) viene accettato', async () => {
    const memberUid = 'member-1'
    await setupLobby('lobby-1', memberUid)
    const user = testEnv.authenticatedContext(memberUid)
    await assertSucceeds(
      addDoc(collection(user.firestore(), 'lobbies', 'lobby-1', 'messages'), {
        senderId: memberUid,
        content: 'Primo messaggio',
        sentAt: new Date(),
      }),
    )
  })

  it('un aggiornamento del contatore con aritmetica non valida viene rifiutato', async () => {
    const memberUid = 'member-1'
    await setupLobby('lobby-1', memberUid)
    const user = testEnv.authenticatedContext(memberUid)
    const memberRef = doc(user.firestore(), 'lobbies', 'lobby-1', 'members', memberUid)
    await assertSucceeds(updateDoc(memberRef, { msgCount: 1, msgWindowStart: serverTimestamp() }))
    await assertFails(updateDoc(memberRef, { msgCount: 5 }))
    await assertSucceeds(updateDoc(memberRef, { msgCount: 2 }))
  })

  it('oltre 10 messaggi nella stessa finestra di 60s vengono rifiutati', async () => {
    const memberUid = 'member-1'
    await setupLobby('lobby-1', memberUid)
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await updateDoc(doc(ctx.firestore(), 'lobbies', 'lobby-1', 'members', memberUid), {
        msgCount: 10,
        msgWindowStart: Timestamp.now(),
      })
    })
    const user = testEnv.authenticatedContext(memberUid)
    await assertFails(
      addDoc(collection(user.firestore(), 'lobbies', 'lobby-1', 'messages'), {
        senderId: memberUid,
        content: 'Flood',
        sentAt: new Date(),
      }),
    )
  })

  it('dopo che la finestra di 60s è scaduta, l\'invio riprende anche con contatore al massimo', async () => {
    const memberUid = 'member-1'
    await setupLobby('lobby-1', memberUid)
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await updateDoc(doc(ctx.firestore(), 'lobbies', 'lobby-1', 'members', memberUid), {
        msgCount: 10,
        msgWindowStart: Timestamp.fromMillis(Date.now() - 120_000),
      })
    })
    const user = testEnv.authenticatedContext(memberUid)
    await assertSucceeds(
      addDoc(collection(user.firestore(), 'lobbies', 'lobby-1', 'messages'), {
        senderId: memberUid,
        content: 'Dopo la finestra',
        sentAt: new Date(),
      }),
    )
  })
})
