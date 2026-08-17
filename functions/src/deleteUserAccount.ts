import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { initializeApp, getApps } from 'firebase-admin/app'
import { writeAuditLog } from './auditLog'

if (getApps().length === 0) {
  initializeApp()
}

const db = getFirestore()

async function deleteCollection(path: string): Promise<void> {
  const snap = await db.collection(path).get()
  const chunks: FirebaseFirestore.DocumentReference[][] = []
  for (let i = 0; i < snap.docs.length; i += 400) {
    chunks.push(snap.docs.slice(i, i + 400).map((d) => d.ref))
  }
  for (const chunk of chunks) {
    const batch = db.batch()
    chunk.forEach((ref) => batch.delete(ref))
    await batch.commit()
  }
}

export const deleteUserAccount = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Autenticazione richiesta')
  }

  const uid = request.auth.uid

  // Legge le appartenenze alle lobby PRIMA di eliminare la sottocollezione,
  // altrimenti non ci sarebbe più modo di sapere da quali lobby rimuovere il membro.
  const membershipsSnap = await db.collection(`users/${uid}/lobbyMemberships`).get()
  await Promise.all(membershipsSnap.docs.map((d) => db.doc(`lobbies/${d.id}/members/${uid}`).delete().catch(() => undefined)))

  await Promise.all([
    deleteCollection(`users/${uid}/characters`),
    deleteCollection(`users/${uid}/customClasses`),
    deleteCollection(`users/${uid}/lobbyMemberships`),
    deleteCollection(`users/${uid}/rateLimits`),
  ])

  await db.doc(`users/${uid}/settings/profile`).delete()

  await writeAuditLog({
    action: 'account.deleted',
    performedBy: uid,
    targetId: uid,
  })

  // Cancellazione definitiva dall'account Firebase Auth.
  await getAuth().deleteUser(uid)
})
