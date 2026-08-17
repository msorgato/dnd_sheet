## ADDED Requirements

### Requirement: Visualizzazione e modifica della scheda personaggio
Il sistema SHALL mostrare per ogni personaggio dell'utente una scheda completa con caratteristiche, competenze, statistiche di combattimento (CA, punti ferita, iniziativa, velocità), funzionalità di classe/specie e, se applicabile, incantesimi conosciuti/preparati.

#### Scenario: Apertura scheda di un personaggio esistente
- **WHEN** l'utente apre un personaggio dalla propria lista
- **THEN** il sistema SHALL visualizzare tutti i dati correnti del personaggio recuperati da `users/{uid}`

#### Scenario: Modifica manuale di un campo della scheda
- **WHEN** l'utente modifica un valore modificabile della scheda (es. punti ferita correnti, note)
- **THEN** il sistema SHALL persistere la modifica su Firestore e riflettere il nuovo valore nella UI

### Requirement: Level-up del personaggio
Il sistema SHALL fornire un flusso di avanzamento di livello che applica le regole di progressione della classe del personaggio (nuovo dado vita, aggiornamento bonus di competenza, nuove funzionalità di classe, eventuali nuovi incantesimi/slot).

#### Scenario: Level-up aumenta il bonus di competenza alle soglie corrette
- **WHEN** il personaggio raggiunge un livello che comporta un aumento del bonus di competenza secondo la tabella D&D 2024
- **THEN** il sistema SHALL aggiornare il bonus di competenza del personaggio al nuovo valore

### Requirement: Persistenza in tempo reale con Firestore
Il sistema SHALL sincronizzare le modifiche alla scheda personaggio con Firestore in modo che siano visibili in altre sessioni/dispositivi dello stesso utente senza refresh manuale.

#### Scenario: Modifica da un dispositivo si riflette su un altro dispositivo collegato
- **WHEN** lo stesso personaggio è aperto su due dispositivi diversi e uno dei due modifica un valore
- **THEN** il sistema SHALL propagare l'aggiornamento all'altro dispositivo tramite listener Firestore in tempo reale
