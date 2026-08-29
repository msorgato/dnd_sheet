## ADDED Requirements

### Requirement: Chat testuale in tempo reale nella lobby
Il sistema SHALL fornire una chat testuale condivisa tra i membri di una stessa lobby, con consegna dei nuovi messaggi in tempo reale senza refresh manuale.

#### Scenario: Un messaggio inviato è visibile a tutti i membri
- **WHEN** un membro della lobby invia un messaggio testuale
- **THEN** il sistema SHALL renderlo visibile in tempo reale a tutti gli altri membri connessi alla stessa lobby

### Requirement: Condivisione di lanci di dado
Il sistema SHALL permettere di eseguire un lancio di dado (es. tiro salvezza, attacco, danno) e pubblicarne automaticamente il risultato come messaggio nella chat della lobby.

#### Scenario: Lancio di dado genera un messaggio di risultato
- **WHEN** un membro esegue un lancio di dado dalla propria scheda all'interno di una lobby
- **THEN** il sistema SHALL pubblicare nella chat della lobby un messaggio con il tipo di tiro e il risultato ottenuto

### Requirement: Limitazione della frequenza dei messaggi
Il sistema SHALL limitare la frequenza di invio messaggi per singolo utente in una lobby (max 10 messaggi ogni 60 secondi), per prevenire abusi (flood) e comportamenti accidentali (es. bug client, doppio invio), applicando la limitazione lato server tramite le regole di sicurezza Firestore, che validano un contatore per membro (`msgCount`/`msgWindowStart` su `lobbies/{lobbyId}/members/{uid}`).

#### Scenario: Invio troppo frequente viene bloccato
- **WHEN** un utente invia più di 10 messaggi nella stessa finestra di 60 secondi
- **THEN** il sistema SHALL rifiutare i messaggi in eccesso senza pubblicarli in chat

#### Scenario: Limite noto — non applicabile a un client non standard
- **WHEN** un client diverso dall'app (es. una chiamata diretta alle API Firestore) crea messaggi senza mai aggiornare il proprio contatore `msgCount`/`msgWindowStart`
- **THEN** le regole SHALL comunque accettare i messaggi, perché non possono obbligare un client a includere l'aggiornamento del contatore nello stesso invio — questo limite è documentato come accettato in assenza di un componente server fidato (Cloud Function), che richiederebbe il piano Firebase Blaze
