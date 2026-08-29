## Why

Il repo `dnd_sheet` è vuoto: serve avviare una web app per la gestione di schede personaggio D&D (regolamento 5ª edizione con le revisioni D&D 2024), analoga per intento e maturità funzionale alla web app gemella `pathfinder_sheet`, ma con dati, terminologia e regole proprie di D&D anziché Pathfinder. I contenuti di gioco completi (specie, classi, talenti, incantesimi) verranno forniti dall'utente in change successive: questa change predispone architettura, stack tecnico e modelli dati con un set minimo di contenuti di esempio.

## What Changes

- Inizializzare il progetto con lo stesso stack tecnico di `pathfinder_sheet`: React 19 + TypeScript + Vite 8, Tailwind CSS v4 (theming via CSS custom properties, nessun `tailwind.config.js`), Zustand per lo stato, `react-router-dom` v7, Firebase (Auth + Firestore + Cloud Functions), Vitest per i test, ESLint flat config.
- Definire i modelli dati di dominio D&D 2024 (in `src/types/index.ts`): `SpeciesDefinition` (ex "razza"), `ClassDefinition` (con `hitDie`, `proficiencyBonus` per livello, salvezze su 6 caratteristiche, spellcasting), `BackgroundDefinition`, `FeatDefinition` (incl. talenti origine/generali/epici del 2024), `SkillDefinition` — con forma analoga a quella di `pathfinder_sheet` ma terminologia e meccaniche D&D (bonus di competenza al posto di BAB, tiri salvezza su tutte le 6 caratteristiche, ecc.).
- Popolare i dati con un set minimo di contenuti segnaposto (poche specie, poche classi base, alcuni talenti/incantesimi di esempio) sufficiente per validare wizard e scheda; il resto del contenuto ufficiale verrà aggiunto in change successive fornite dall'utente.
- Implementare creazione personaggio (wizard) e scheda personaggio completa (caratteristiche, competenze, statistiche di combattimento, incantesimi, funzionalità di classe, level-up), con persistenza su Firestore sotto `users/{uid}`.
- Replicare le funzionalità avanzate di `pathfinder_sheet` per parità di scope v1: lobby multiplayer con selezione personaggio condivisa, chat/lancio dadi in tempo reale, pannello admin per creare e pubblicare classi custom nella libreria condivisa, audit log delle azioni admin, cancellazione account (diritto GDPR) via Cloud Function.
- Definire una palette tema di default "virante verso il rosso" (nuova variante, ispirata alla struttura del tema `blood` già presente in `pathfinder_sheet` ma con identità propria per D&D), mantenendo il pattern di variabili CSS semantiche per rendere il tema sostituibile.
- Configurare l'hosting: Vercel per il frontend (SPA rewrite), Firebase per Auth/Firestore/Functions — file di configurazione pronti (`firebase.json`, `vercel.json`, `.env.example`, `firestore.rules`) più i passi manuali (login CLI, creazione progetti) da eseguire dall'utente, poiché richiedono credenziali interattive.
- Impostare regole di sicurezza Firestore per le collezioni `users/{uid}`, `library/{...}` (contenuti condivisi/pubblicati), `lobbies/{...}` (con sottocollezioni membri/messaggi) e `audit_log/{...}`.

## Capabilities

### New Capabilities
- `character-creation`: wizard guidato per creare un nuovo personaggio D&D 2024 (specie, classe, background, punteggi caratteristica, competenze, equipaggiamento iniziale).
- `character-sheet`: scheda personaggio persistente e modificabile (caratteristiche, competenze, statistiche di combattimento, funzionalità di classe, incantesimi, level-up).
- `builtin-rules-database`: modello dati e contenuti di base (segnaposto) per specie, classi, background, talenti e incantesimi del regolamento D&D 2024.
- `custom-class-authoring`: strumenti admin per creare, modificare e pubblicare classi homebrew nella libreria condivisa.
- `party-lobby`: creazione/adesione a lobby multiplayer con associazione di personaggi e visualizzazione dei membri del gruppo.
- `lobby-chat`: chat testuale e condivisione di risultati di lancio dadi in tempo reale all'interno di una lobby.
- `account-data-rights`: cancellazione account su richiesta dell'utente e audit log delle azioni amministrative, per conformità GDPR.
- `app-theming`: temi visivi selezionabili, incluso un tema di default a dominante rossa per l'identità D&D.
- `firestore-security-rules`: regole di accesso per dati utente privati, libreria condivisa, lobby e audit log.

### Modified Capabilities
(nessuna: il repository è vuoto, non esistono capability preesistenti)

## Impact

- **Codice**: intero scaffold iniziale del progetto (`package.json`, config Vite/TS/ESLint/Tailwind, `src/`, `functions/`, `tests/`, `public/data/`).
- **Infrastruttura**: nuovo progetto Firebase (Auth, Firestore, Cloud Functions) e nuovo progetto Vercel da collegare al repo GitHub `msorgato/dnd_sheet` esistente.
- **Dipendenze**: React, Firebase SDK, Zustand, react-router-dom, Tailwind v4, Vitest, ESLint — allineate alle versioni usate in `pathfinder_sheet` salvo aggiornamenti minori.
- **Dati**: contenuti di gioco iniziali limitati a un set di esempio; l'utente fornirà in seguito i cataloghi completi di specie/classi/talenti/incantesimi D&D 2024.
