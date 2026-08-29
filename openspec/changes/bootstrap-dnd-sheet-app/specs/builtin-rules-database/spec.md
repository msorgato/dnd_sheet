## ADDED Requirements

### Requirement: Modello dati delle specie D&D 2024
Il sistema SHALL definire un tipo `SpeciesDefinition` che rappresenta una specie giocabile secondo le regole D&D 2024 (taglia, velocità, tratti, resistenze/abilità di specie, linguaggi), distinto dal modello `RaceDefinition` usato da Pathfinder.

#### Scenario: Una specie built-in è conforme al tipo
- **WHEN** il sistema carica l'elenco delle specie built-in
- **THEN** ogni voce SHALL rispettare l'interfaccia `SpeciesDefinition` (campi obbligatori presenti e tipizzati correttamente)

### Requirement: Modello dati delle classi D&D 2024
Il sistema SHALL definire un tipo `ClassDefinition` con dado vita, bonus di competenza, competenze su tiri salvezza (2 delle 6 caratteristiche), competenze di classe, funzionalità per livello ed eventuale spellcasting, distinto dal modello Pathfinder (niente BAB, niente progressioni fort/ref/will separate).

#### Scenario: Una classe con spellcasting espone la progressione slot
- **WHEN** una classe built-in ha `spellcasting` definito
- **THEN** il sistema SHALL esporre la progressione degli slot incantesimo per livello associata a quella classe

### Requirement: Modello dati di talenti, background e competenze
Il sistema SHALL definire i tipi `FeatDefinition` (con categoria `origin | general | fighting-style | epic-boon`), `BackgroundDefinition` e `SkillDefinition` coerenti con le regole D&D 2024.

#### Scenario: Un talento origine richiede una specifica categoria
- **WHEN** il sistema filtra i talenti disponibili durante la creazione personaggio per il passo "talento di origine"
- **THEN** SHALL restituire solo i talenti con `category: 'origin'`

### Requirement: Dataset segnaposto per validazione end-to-end
Il sistema SHALL includere un set minimo di dati di esempio (almeno 2 specie, 2 classi, alcuni talenti e incantesimi) sufficiente a percorrere l'intero flusso di creazione e gestione personaggio senza errori, in attesa dei cataloghi completi forniti dall'utente.

#### Scenario: Wizard completabile con solo i dati segnaposto
- **WHEN** un utente crea un personaggio usando esclusivamente le specie/classi/talenti inclusi come dati di esempio
- **THEN** il wizard SHALL completarsi senza errori e produrre una scheda personaggio valida

### Requirement: Caricamento cataloghi di grandi dimensioni a runtime
Talenti e incantesimi, potenzialmente numerosi, SHALL essere serviti come JSON statico sotto `public/data/` e caricati a runtime via `fetch`, mentre specie e classi (insiemi più piccoli e curati) SHALL restare moduli TypeScript statici in `src/data/`.

#### Scenario: Il catalogo talenti si carica senza gonfiare il bundle applicativo
- **WHEN** l'applicazione si avvia
- **THEN** il contenuto di `public/data/feats.json` SHALL essere recuperato via `fetch` e non incluso nel bundle JavaScript compilato
