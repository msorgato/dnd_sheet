## ADDED Requirements

### Requirement: Cancellazione account su richiesta dell'utente
Il sistema SHALL permettere a un utente autenticato di richiedere la cancellazione definitiva del proprio account e di tutti i dati personali associati (personaggi, appartenenza a lobby, messaggi inviati riconducibili all'utente).

#### Scenario: Richiesta di cancellazione elimina i dati dell'utente
- **WHEN** un utente autenticato conferma la richiesta di cancellazione account
- **THEN** una Cloud Function SHALL eliminare il documento utente, i personaggi associati e l'account di autenticazione

#### Scenario: Cancellazione richiede una conferma esplicita
- **WHEN** l'utente apre la funzione di cancellazione account
- **THEN** il sistema SHALL richiedere una conferma esplicita e irreversibile prima di procedere

### Requirement: Audit log delle azioni amministrative
Il sistema SHALL registrare in un log di audit, scrivibile solo tramite Cloud Function con Admin SDK, le azioni amministrative sensibili (es. pubblicazione/rimozione contenuti in libreria, cancellazione account di altri utenti).

#### Scenario: Pubblicazione di una classe custom genera una voce di audit
- **WHEN** un admin pubblica una classe custom nella libreria condivisa
- **THEN** il sistema SHALL registrare una voce in `audit_log` con l'identificativo dell'admin, l'azione e il timestamp

#### Scenario: Nessun client può scrivere direttamente nel log di audit
- **WHEN** un client (utente o admin) tenta di scrivere direttamente in `audit_log` senza passare da una Cloud Function
- **THEN** le regole di sicurezza Firestore SHALL rifiutare l'operazione
