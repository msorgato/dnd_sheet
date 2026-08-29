## ADDED Requirements

### Requirement: Temi visivi selezionabili tramite variabili CSS
Il sistema SHALL supportare più temi visivi commutabili a runtime, ciascuno definito come insieme di variabili CSS semantiche (`--theme-bg`, `--theme-accent`, `--theme-text`, `--theme-danger`, `--theme-hp-high/mid/low`, ecc.) attivate tramite un attributo `data-theme` sull'elemento radice.

#### Scenario: Cambio tema aggiorna l'aspetto senza ricaricare la pagina
- **WHEN** l'utente seleziona un tema diverso dal selettore tema
- **THEN** il sistema SHALL applicare immediatamente le nuove variabili CSS a tutta l'interfaccia senza refresh della pagina

### Requirement: Tema di default a dominante rossa
Il sistema SHALL includere un tema di default con palette a dominante rossa, distinto da qualunque tema di `pathfinder_sheet`, costruito sullo stesso pattern di variabili semantiche.

#### Scenario: Primo avvio applica il tema di default
- **WHEN** un utente apre l'applicazione per la prima volta senza una preferenza tema salvata
- **THEN** il sistema SHALL applicare il tema di default a dominante rossa

### Requirement: Persistenza della preferenza tema
Il sistema SHALL ricordare la preferenza tema scelta dall'utente e riapplicarla automaticamente nelle sessioni successive.

#### Scenario: Preferenza tema persiste dopo il logout/login
- **WHEN** un utente sceglie un tema, effettua logout e poi accede nuovamente
- **THEN** il sistema SHALL riapplicare il tema precedentemente scelto
