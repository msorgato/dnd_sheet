## ADDED Requirements

### Requirement: Editor di classi custom per amministratori
Il sistema SHALL fornire un pannello, accessibile solo agli utenti con ruolo admin, per creare e modificare definizioni di classi custom (homebrew) usando la stessa forma dati delle classi built-in.

#### Scenario: Utente non admin non può accedere all'editor
- **WHEN** un utente autenticato senza ruolo admin tenta di aprire il pannello di editing classi custom
- **THEN** il sistema SHALL negare l'accesso e non mostrare i contenuti dell'editor

#### Scenario: Admin salva una bozza di classe custom
- **WHEN** un admin compila i campi obbligatori di una classe custom e salva
- **THEN** il sistema SHALL persistere la bozza in un'area privata (non ancora pubblica) associata all'admin autore

### Requirement: Pubblicazione nella libreria condivisa
Il sistema SHALL permettere a un admin di pubblicare una classe custom completata nella libreria condivisa (`library/classes/entries`), rendendola disponibile a tutti gli utenti nel wizard di creazione personaggio.

#### Scenario: Pubblicazione rende la classe selezionabile da tutti gli utenti
- **WHEN** un admin pubblica una classe custom precedentemente in bozza
- **THEN** la classe SHALL comparire nell'elenco delle classi disponibili nel wizard di creazione personaggio per qualsiasi utente

#### Scenario: Utenti non admin non possono pubblicare
- **WHEN** un utente non admin tenta di scrivere direttamente in `library/classes/entries`
- **THEN** le regole di sicurezza Firestore SHALL rifiutare l'operazione
