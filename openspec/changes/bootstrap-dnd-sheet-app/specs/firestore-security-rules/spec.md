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

### Requirement: Audit log in lettura solo admin, in scrittura solo `create` validato
Le regole di sicurezza Firestore SHALL permettere la lettura di `audit_log/{document=**}` ai soli utenti admin, e la scrittura ai client solo in forma di `create` con schema validato (`performedBy` uguale all'autore autenticato, `timestamp` uguale al timestamp del server, azione ammessa in base al ruolo), senza mai permettere `update` o `delete`.

#### Scenario: Una voce di audit log ben formata viene accettata
- **WHEN** un admin autenticato crea una voce con `action` di libreria, `performedBy` pari al proprio uid e `timestamp` generato dal server
- **THEN** le regole SHALL accettare la scrittura

#### Scenario: Nessun client può alterare una voce di audit log dopo la creazione
- **WHEN** un utente admin autenticato tenta un `update` o `delete` su un documento esistente in `audit_log`
- **THEN** le regole SHALL rifiutare l'operazione
