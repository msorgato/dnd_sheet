## ADDED Requirements

### Requirement: Isolamento dei dati privati per utente
Le regole di sicurezza Firestore SHALL permettere l'accesso in lettura/scrittura a `users/{uid}/{document=**}` solo all'utente autenticato con lo stesso `uid`.

#### Scenario: Un utente non può leggere i dati di un altro utente
- **WHEN** un utente autenticato tenta di leggere `users/{altroUid}/...` dove `altroUid` non corrisponde al proprio uid
- **THEN** le regole SHALL rifiutare la lettura

### Requirement: Libreria condivisa in lettura pubblica, scrittura solo admin
Le regole di sicurezza Firestore SHALL permettere la lettura di `library/{document=**}` a qualsiasi utente autenticato e la scrittura solo agli utenti con ruolo admin.

#### Scenario: Un utente autenticato non admin può leggere ma non scrivere in libreria
- **WHEN** un utente autenticato non admin tenta di leggere una voce in `library/classes/entries` e successivamente di modificarla
- **THEN** la lettura SHALL essere consentita e la scrittura SHALL essere rifiutata

### Requirement: Accesso alle lobby basato sull'appartenenza
Le regole di sicurezza Firestore SHALL permettere l'accesso a una lobby e alle sue sottocollezioni (`members`, `messages`) solo agli utenti che ne sono membri, con permessi di gestione aggiuntivi per owner e GM.

#### Scenario: Un utente esterno alla lobby non può leggerne i messaggi
- **WHEN** un utente autenticato che non è membro di una lobby tenta di leggere `lobbies/{lobbyId}/messages`
- **THEN** le regole SHALL rifiutare la lettura

### Requirement: Audit log accessibile solo in lettura admin
Le regole di sicurezza Firestore SHALL permettere la sola lettura di `audit_log/{document=**}` agli utenti admin, senza consentire alcuna scrittura diretta da client.

#### Scenario: Nessun client, admin incluso, può scrivere direttamente nell'audit log
- **WHEN** un utente admin autenticato tenta una scrittura diretta (non tramite Cloud Function) su `audit_log`
- **THEN** le regole SHALL rifiutare la scrittura
