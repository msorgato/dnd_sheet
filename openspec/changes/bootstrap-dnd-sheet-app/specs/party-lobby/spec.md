## ADDED Requirements

### Requirement: Creazione e adesione a una lobby
Il sistema SHALL permettere a un utente autenticato di creare una lobby multiplayer e ad altri utenti di aderirvi tramite invito/codice, associando a ciascun membro uno dei propri personaggi.

#### Scenario: Creazione di una lobby imposta l'utente come owner
- **WHEN** un utente autenticato crea una nuova lobby
- **THEN** il sistema SHALL registrarlo come owner della lobby con permessi di gestione membri

#### Scenario: Adesione con personaggio associato
- **WHEN** un utente aderisce a una lobby esistente e seleziona uno dei propri personaggi
- **THEN** il sistema SHALL aggiungerlo alla sottocollezione `members` della lobby con il riferimento al personaggio selezionato

### Requirement: Ruoli all'interno della lobby
Il sistema SHALL distinguere almeno i ruoli owner, Game Master (GM) e member, ciascuno con permessi differenziati su gestione membri e visualizzazione schede altrui.

#### Scenario: Il GM può visualizzare le schede di tutti i membri
- **WHEN** un membro con ruolo GM apre la vista di gruppo della lobby
- **THEN** il sistema SHALL mostrargli le schede riassuntive di tutti i personaggi associati ai membri

#### Scenario: Un member non può rimuovere altri membri
- **WHEN** un membro con ruolo `member` tenta di rimuovere un altro membro dalla lobby
- **THEN** il sistema SHALL rifiutare l'operazione
