## 1. Bootstrap progetto e stack tecnico

- [x] 1.1 Inizializzare progetto Vite (React + TypeScript) e installare React 19, `react-router-dom` v7, Zustand 5, Firebase JS SDK, `@vercel/analytics`
- [x] 1.2 Configurare Tailwind CSS v4 via `@tailwindcss/vite` (nessun `tailwind.config.js`) e `@tailwindcss/forms`
- [x] 1.3 Configurare TypeScript a progetti multipli (`tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `tsconfig.test.json`) coerenti con `pathfinder_sheet`
- [x] 1.4 Configurare ESLint flat config (`eslint.config.js`) con `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- [x] 1.5 Configurare Vitest (unit test) e `@vitest/coverage-v8`
- [x] 1.6 Aggiornare `README.md` con descrizione reale del progetto, stack e istruzioni di setup (a differenza del gemello, non lasciarlo come boilerplate Vite)
- [x] 1.7 Creare `.env.example` con le variabili `VITE_FIREBASE_*` richieste dal SDK Firebase Web

## 2. Modelli dati D&D 2024

- [x] 2.1 Definire in `src/types/index.ts` i tipi `SpeciesDefinition`, `ClassDefinition`, `BackgroundDefinition`, `FeatDefinition` (con `category: 'origin' | 'general' | 'fighting-style' | 'epic-boon'`), `SkillDefinition`, `AbilityScores`, `SpellDefinition`
- [x] 2.2 Definire il modello `CustomClassDefinition` per le classi homebrew create dagli admin, coerente con `ClassDefinition` ma con progressioni definite come dati anziché enum
- [x] 2.3 Implementare le utility di calcolo in `src/utils/calculations.ts` (modificatori caratteristica, bonus di competenza per livello, CA base, tiri salvezza, iniziativa)
- [x] 2.4 Scrivere test unitari per le utility di calcolo con casi ai limiti (livello 1, soglie di aumento del bonus di competenza)

## 3. Dati di gioco segnaposto

- [x] 3.1 Creare `src/data/species.ts` con 2-3 specie di esempio (es. Umano, Elfo) conformi a `SpeciesDefinition`
- [x] 3.2 Creare `src/data/classes/` con 2-3 classi base di esempio (es. Guerriero, Mago) in file separati aggregati da `src/data/classes/index.ts` (pattern one-file-per-classe come nel gemello)
- [x] 3.3 Creare `public/data/feats.json` e `public/data/spells.json` con alcune voci di esempio, caricate a runtime dal `dataStore`
- [x] 3.4 Creare `src/data/backgrounds.ts` e `src/data/skills.ts` con un set minimo coerente con le regole D&D 2024

## 4. Stato applicativo e persistenza

- [x] 4.1 Implementare `authStore` (Zustand) per stato autenticazione Firebase
- [x] 4.2 Implementare `characterStore` per il personaggio corrente, con azioni di lettura/scrittura Firestore
- [x] 4.3 Implementare `dataStore` per il caricamento dei cataloghi built-in (specie/classi statiche + talenti/incantesimi via fetch JSON)
- [x] 4.4 Implementare `src/lib/firebase.ts` (inizializzazione app Firebase) e `src/lib/firestoreSync.ts` (sync in tempo reale personaggio ↔ Firestore)

## 5. Creazione personaggio e scheda (capability: character-creation, character-sheet)

- [x] 5.1 Implementare il wizard multi-step (specie, classe, background, punteggi caratteristica, competenze, equipaggiamento, dettagli) in `src/pages/CharacterWizard` + `src/components/wizard/`
- [x] 5.2 Implementare il calcolo/anteprima in tempo reale dei valori derivati durante il wizard
- [x] 5.3 Implementare la pagina scheda personaggio (`src/pages/CharacterSheet`) con pannelli caratteristiche, competenze, statistiche di combattimento, funzionalità, incantesimi
- [x] 5.4 Implementare il flusso di level-up (`src/components/levelup/LevelUpWizard`) con aggiornamento bonus di competenza e nuove funzionalità/slot incantesimo
- [x] 5.5 Scrivere test per il flusso end-to-end di creazione personaggio con i soli dati segnaposto (verifica scenario "wizard completabile")

## 6. Multiplayer: lobby e chat (capability: party-lobby, lobby-chat)

- [x] 6.1 Implementare `lobbyStore` e `src/lib/lobbySync.ts` per creazione/adesione lobby e gestione membri in tempo reale
- [x] 6.2 Implementare le pagine `LobbiesPage` e `LobbyDetailPage` con visualizzazione membri e personaggi associati
- [x] 6.3 Implementare i ruoli owner/GM/member con permessi differenziati lato client (nascondere azioni non permesse) e lato regole (vedi sezione 8)
- [x] 6.4 Implementare la chat di lobby (`ChatPanel`, `RollMessage`) con invio messaggi e pubblicazione automatica dei risultati di lancio dado
- [x] 6.5 Implementare la Cloud Function `throttleMessages` per limitare la frequenza di invio messaggi per utente
- [x] 6.6 Scrivere test per lobbyStore/lobbySync (creazione, adesione, ruoli)

## 7. Amministrazione classi custom (capability: custom-class-authoring)

- [x] 7.1 Implementare `AdminPanel`, `CustomClassEditor` e `CustomClassList` per creare/modificare classi custom come admin
- [x] 7.2 Implementare il flusso di salvataggio bozza (area privata admin) e di pubblicazione in `library/classes/entries`
- [x] 7.3 Integrare le classi custom pubblicate come opzione selezionabile nel wizard di creazione personaggio

## 8. Regole di sicurezza Firestore (capability: firestore-security-rules)

- [x] 8.1 Scrivere `firestore.rules` con le sezioni `users/{uid}/{document=**}`, `library/{document=**}`, `lobbies/{lobbyId}` (+ `members`, `messages`), `audit_log/{document=**}` e le funzioni helper (`isOwner`, `isAdmin`, `isLobbyMember`, `isLobbyOwner`, `isLobbyGM`)
- [x] 8.2 Scrivere `tests/firestore.rules.test.ts` con `@firebase/rules-unit-testing`, uno scenario per ciascun requisito delle spec `firestore-security-rules` e `account-data-rights`
- [x] 8.3 Documentare nel README come avviare l'emulatore Firestore ed eseguire `npm run test:rules`

## 9. Conformità: audit log e diritti account (capability: account-data-rights)

- [x] 9.1 Implementare la Cloud Function `auditLog` (scrittura via Admin SDK in `audit_log` per azioni admin sensibili)
- [x] 9.2 Implementare la Cloud Function `deleteUserAccount` (cancellazione documento utente, personaggi, account Auth) con conferma esplicita lato client
- [x] 9.3 Aggiungere la UI di richiesta cancellazione account in `AccountSettings` con dialogo di conferma irreversibile

## 10. Tema visivo a dominante rossa (capability: app-theming)

- [x] 10.1 Definire in `src/index.css` le variabili CSS semantiche (`--theme-bg`, `--theme-accent`, `--theme-text`, `--theme-danger`, `--theme-hp-high/mid/low`, ecc.) e il nuovo tema di default a dominante rossa
- [x] 10.2 Implementare `themeStore` e `ThemeSwitcher` per selezione e persistenza della preferenza tema (localStorage o profilo utente)
- [x] 10.3 Scegliere e integrare un font stack coerente con l'identità D&D (da definire, alternativa ai font "manoscritto" usati dal gemello)
- [ ] 10.4 Verificare visivamente il tema di default e almeno una variante su wizard, scheda e lobby

## 11. Hosting e deployment

- [x] 11.1 Creare `vercel.json` con rewrite SPA (`/(.*)` → `/index.html`)
- [x] 11.2 Creare `firebase.json` con configurazione `firestore.rules` e `functions` (source `functions`, codebase `default`)
- [x] 11.3 Inizializzare `functions/` (Node, TypeScript, `firebase-admin`, `firebase-functions`) con `index.ts` che esporta `throttleMessages`, `auditLog`, `deleteUserAccount`
- [ ] 11.4 **[Azione manuale utente]** Creare un nuovo progetto Firebase dedicato a `dnd_sheet`, abilitare Authentication e Firestore, copiare le credenziali Web SDK in `.env`
- [ ] 11.5 **[Azione manuale utente]** Effettuare login Firebase CLI (`firebase login`) e collegare il progetto locale (`firebase use --add`)
- [ ] 11.6 **[Azione manuale utente]** Creare un nuovo progetto Vercel collegato al repository GitHub `msorgato/dnd_sheet`, configurare le variabili d'ambiente `VITE_FIREBASE_*` nel pannello Vercel
- [ ] 11.7 **[Azione manuale utente]** Eseguire il primo deploy delle Cloud Functions (`firebase deploy --only functions`) e verificare il primo deploy Vercel del frontend

## 12. Verifica finale

- [x] 12.1 Eseguire `npm run lint`, `npm run build`, `npm run test` senza errori
- [x] 12.2 Eseguire `npm run test:rules` con emulatore Firestore attivo e verificare tutti gli scenari delle regole di sicurezza
- [ ] 12.3 Percorrere manualmente il flusso completo: registrazione/login → creazione personaggio → scheda → level-up → creazione lobby → chat/lancio dado → (come admin) creazione e pubblicazione classe custom → cambio tema → richiesta cancellazione account
