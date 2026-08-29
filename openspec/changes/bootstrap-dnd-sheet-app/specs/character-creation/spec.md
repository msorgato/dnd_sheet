## ADDED Requirements

### Requirement: Wizard di creazione personaggio
Il sistema SHALL fornire un wizard guidato a passi (specie, classe, background, punteggi caratteristica, competenze, equipaggiamento iniziale, dettagli) per creare un nuovo personaggio D&D 2024 associato all'utente autenticato.

#### Scenario: Completamento wizard crea un personaggio salvato
- **WHEN** un utente autenticato completa tutti i passi del wizard con selezioni valide
- **THEN** il sistema SHALL creare un nuovo documento personaggio sotto `users/{uid}` in Firestore con i dati raccolti in tutti i passi

#### Scenario: Uscita anticipata non salva un personaggio incompleto
- **WHEN** l'utente abbandona il wizard prima di completare tutti i passi obbligatori
- **THEN** il sistema SHALL non creare alcun documento personaggio persistente

### Requirement: Selezione specie e classe
Il wizard SHALL permettere di scegliere una specie e una classe tra quelle disponibili nel database built-in (`builtin-rules-database`) o tra le classi custom pubblicate nella libreria condivisa.

#### Scenario: Selezione di una classe custom pubblicata
- **WHEN** l'utente seleziona una classe presente in `library/classes/entries`
- **THEN** il wizard SHALL applicare le regole (dado vita, competenze, progressione) definite in quella classe custom al personaggio in creazione

### Requirement: Calcolo automatico dei punteggi derivati
Durante il wizard, il sistema SHALL calcolare automaticamente i valori derivati dai punteggi caratteristica scelti (modificatori, classe armatura base, tiri salvezza, bonus di competenza in base al livello iniziale) e mostrarli in anteprima prima del salvataggio.

#### Scenario: Modifica di un punteggio caratteristica aggiorna i derivati in tempo reale
- **WHEN** l'utente modifica un punteggio caratteristica in un passo del wizard
- **THEN** il sistema SHALL ricalcolare e mostrare senza ricaricare la pagina i modificatori e le statistiche derivate coinvolte
