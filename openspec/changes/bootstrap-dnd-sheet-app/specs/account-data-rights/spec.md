## ADDED Requirements

### Requirement: Cancellazione account su richiesta dell'utente
Il sistema SHALL permettere a un utente autenticato di richiedere la cancellazione definitiva del proprio account e di tutti i dati personali associati (personaggi, appartenenza a lobby, messaggi inviati riconducibili all'utente).

#### Scenario: Richiesta di cancellazione elimina i dati dell'utente
- **WHEN** un utente autenticato conferma la richiesta di cancellazione account
- **THEN** il client SHALL eliminare tramite l'SDK Firebase (Firestore e Authentication) il documento utente, i personaggi, le classi custom, le appartenenze a lobby e l'account di autenticazione, in quest'ordine (dati prima, account Auth per ultimo, così un tentativo interrotto lascia solo lavoro residuo idempotente da completare al retry)

#### Scenario: Cancellazione richiede una conferma esplicita
- **WHEN** l'utente apre la funzione di cancellazione account
- **THEN** il sistema SHALL richiedere una conferma esplicita e irreversibile prima di procedere

### Requirement: Audit log delle azioni amministrative
Il sistema SHALL registrare in un log di audit le azioni amministrative sensibili (es. pubblicazione/rimozione contenuti in libreria) e l'autocancellazione di un account, tramite scrittura diretta dal client validata dalle regole di sicurezza Firestore: solo `create` (mai `update`/`delete`), `performedBy` deve coincidere con l'autore autenticato della richiesta, e `timestamp` deve essere il timestamp del server (non falsificabile dal client).

#### Scenario: Pubblicazione di una classe custom genera una voce di audit
- **WHEN** un admin pubblica o rimuove una classe custom nella libreria condivisa
- **THEN** il sistema SHALL registrare una voce in `audit_log` con l'identificativo dell'admin, l'azione e il timestamp del server

#### Scenario: Nessun client può scrivere una voce di audit a nome di un altro utente
- **WHEN** un client tenta di scrivere in `audit_log` con `performedBy` diverso dal proprio uid, o un'azione di libreria senza ruolo admin, o l'autocancellazione di un account che non è il proprio
- **THEN** le regole di sicurezza Firestore SHALL rifiutare la scrittura

#### Scenario: Nessun client può modificare o eliminare una voce di audit già scritta
- **WHEN** un client (admin incluso) tenta un `update` o `delete` su un documento esistente in `audit_log`
- **THEN** le regole di sicurezza Firestore SHALL rifiutare l'operazione
