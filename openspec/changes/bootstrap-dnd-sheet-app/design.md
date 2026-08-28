## Context

`dnd_sheet` è un repository nuovo (solo README + scaffold OpenSpec). Il progetto gemello `pathfinder_sheet` implementa una web app di gestione schede personaggio Pathfinder con: React 19 + TS + Vite 8 + Tailwind v4 (theming via CSS variables) + Zustand + `react-router-dom` v7 + Firebase (Auth/Firestore/Functions) + hosting su Vercel, oltre a funzionalità multiplayer (lobby, chat), un pannello admin per classi custom pubblicabili in una libreria condivisa, audit log e cancellazione account GDPR. `dnd_sheet` deve replicare la stessa architettura applicativa, sostituendo le regole e i contenuti di gioco con quelli di D&D 5ª edizione con integrazioni D&D 2024, e con una palette a dominante rossa. I contenuti di gioco completi (specie, classi, talenti, incantesimi ufficiali) saranno forniti dall'utente in change successive: qui si definiscono solo le forme dei dati e un piccolo set segnaposto.

## Goals / Non-Goals

**Goals:**
- Bootstrap completo dello stack tecnico, identico a `pathfinder_sheet` salvo differenze di dominio, per minimizzare la curva di apprendimento e riusare pattern già collaudati (store Zustand, sync Firestore, struttura cartelle).
- Modelli dati TypeScript per il dominio D&D 2024 (specie, classi, background, talenti, competenze, incantesimi) con meccaniche corrette: bonus di competenza al posto di BAB, tiri salvezza su tutte e 6 le caratteristiche, talenti origine/generali/da classe/epici.
- Parità funzionale v1 con `pathfinder_sheet`: creazione personaggio, scheda, level-up, lobby multiplayer, chat/lancio dadi, editor classi custom con pubblicazione in libreria, audit log, cancellazione account.
- Palette e identità visiva distinta (dominante rossa) mantenendo il pattern di variabili CSS semantiche già usato dal gemello, per restare facilmente tematizzabile.
- Configurazione hosting pronta all'uso (Vercel + Firebase) con passi manuali documentati per gli account/progetti che richiedono setup interattivo.

**Non-Goals:**
- Non popolare cataloghi completi e ufficiali di specie/classi/talenti/incantesimi D&D 2024: solo dati segnaposto sufficienti a validare wizard, scheda e regole di calcolo. Il contenuto reale arriva in change successive fornite dall'utente.
- Non implementare supporto multi-ruleset (2014 + 2024 selezionabili): si modella solo la baseline 2024, come da decisione esplicita.
- Non migrare o importare dati/utenti da `pathfinder_sheet`: sono applicazioni indipendenti che condividono solo pattern architetturali, non dati né progetti cloud.
- Non automatizzare la creazione di account/progetti Firebase o Vercel (richiede login interattivo dell'utente): questa change prepara solo i file di configurazione e la checklist dei passi manuali.

## Decisions

### 1. Stack tecnico identico a `pathfinder_sheet`
Riusiamo React 19 + TypeScript + Vite 8 + Tailwind v4 (config-free, CSS custom properties) + Zustand + `react-router-dom` v7 + Firebase + Vitest + ESLint flat config, con le stesse versioni maggiori.
**Alternative considerate**: introdurre Next.js per SSR, o Redux/Context al posto di Zustand. Scartate perché la coerenza con il progetto gemello riduce il rischio e il costo cognitivo, e nessuno dei due porta benefici concreti per una SPA di questo tipo.

### 2. Modelli dati D&D 2024 paralleli a quelli Pathfinder ma non riusati
`SpeciesDefinition` (ex `RaceDefinition`), `ClassDefinition`, `BackgroundDefinition`, `FeatDefinition`, `SkillDefinition` vengono ridefiniti da zero in `src/types/index.ts` per riflettere le meccaniche D&D:
- `ClassDefinition.proficiencyBonus` sostituisce `bab` (bonus unico che scala col livello personaggio, non per classe).
- `saves` diventa un set fisso sulle 6 caratteristiche (`str, dex, con, int, wis, cha`) invece delle 3 progressioni Pathfinder (fort/ref/will) — in D&D 5e/2024 ogni classe garantisce competenza su 2 caratteristiche specifiche, non una progressione numerica per salvezza.
- `FeatDefinition` include una `category: 'origin' | 'general' | 'fighting-style' | 'epic-boon'` per riflettere le categorie di talenti introdotte da D&D 2024.
- `SpeciesDefinition` mantiene struttura simile a `RaceDefinition` (tratti, velocità, taglia) ma rimuove `bonusFeat`/`bonusSkillRanks` specifici Pathfinder e aggiunge campi coerenti col 2024 (es. resistenze/tratti di specie fissi, niente più bonus caratteristica legato alla specie come nel 2014).
**Alternative considerate**: riusare le interfacce Pathfinder con campi opzionali estesi. Scartata perché le meccaniche divergono abbastanza da rendere un modello condiviso confuso e soggetto a campi "non applicabili" per l'uno o l'altro regolamento.

### 3. Dati segnaposto invece di cataloghi completi
Solo 2-3 specie, 2-3 classi base, una manciata di talenti/incantesimi di esempio, sufficienti per: validare il wizard end-to-end, i calcoli (CA, tiri salvezza, competenze), e i test. Il pattern di caricamento resta quello di `pathfinder_sheet`: specie/classi come moduli TS statici in `src/data/`, cataloghi potenzialmente grandi (talenti, incantesimi) come JSON in `public/data/` caricati a runtime via `fetch`.
**Alternative considerate**: bloccare la change finché l'utente non fornisce i dati completi. Scartata perché l'utente ha esplicitamente chiesto di "predisporre i modelli" nel frattempo, disaccoppiando lo scaffold architetturale dal popolamento dati.

### 4. Parità funzionale completa v1 (lobby, chat, admin, audit, GDPR)
Replichiamo l'intera superficie funzionale di `pathfinder_sheet` fin da questa change, invece di partire da un MVP ridotto, come da scelta esplicita dell'utente. Le regole Firestore ricalcano la struttura del gemello: `users/{uid}/{document=**}` privato, `library/{document=**}` pubblico in lettura/admin in scrittura, `lobbies/{lobbyId}` con sottocollezioni `members`/`messages` e ruoli owner/GM/member, `audit_log/{document=**}` in lettura solo admin. Diversamente dal gemello (che usa Cloud Functions con Admin SDK per audit log, cancellazione account e throttling), qui queste tre funzionalità sono implementate senza Cloud Functions — vedi Decisione 7.
**Alternative considerate**: MVP con sola scheda personaggio. Scartata su indicazione esplicita dell'utente in fase di chiarimento.

### 5. Tema "a dominante rossa" come nuova variante indipendente
Nuovo tema di default (nome da definire in fase di implementazione, es. `crimson`/`vermilion`) costruito sullo stesso pattern di variabili CSS semantiche (`--theme-bg`, `--theme-accent`, `--theme-text`, `--theme-danger`, `--theme-hp-*`) usato da `pathfinder_sheet`, ispirandosi alla struttura del tema `blood` esistente ma con palette e identità proprie per D&D (non un semplice re-skin).
**Alternative considerate**: riusare il tema `blood` di `pathfinder_sheet` tale quale. Scartata perché i due progetti sono indipendenti (nessuna dipendenza di codice condivisa) e l'utente ha chiesto una palette "lievemente diversa", non identica.

### 6. Hosting: Vercel per il frontend, Firebase per backend-as-a-service
Stessa separazione del gemello: `vercel.json` con rewrite SPA per il frontend statico; `firebase.json` limitato a Firestore rules (niente Firebase Hosting, niente Cloud Functions — vedi Decisione 7). Progetti Firebase e Vercel nuovi e indipendenti da quelli di `pathfinder_sheet`.
**Alternative considerate**: Firebase Hosting invece di Vercel. Scartata per coerenza con il gemello e perché l'utente ha chiesto esplicitamente entrambe le piattaforme (Vercel per hosting frontend, Firebase per i servizi backend).

### 7. Decisione presa a posteriori: niente Cloud Functions, niente piano Blaze
Dopo aver creato il progetto Firebase (`dnd-sheet-2026`) e verificato che il deploy delle Cloud Functions richiede il piano Blaze (carta di credito registrata, anche se l'uso reale resterebbe entro la soglia gratuita), l'utente ha scelto di non attivarlo. Le tre funzionalità originariamente previste come Cloud Function con Admin SDK sono state riprogettate:
- **Cancellazione account**: interamente lato client (`deleteUser` + pulizia Firestore via SDK client), permessa dalle regole esistenti su `users/{uid}/{document=**}` senza modifiche. Nessuna perdita di garanzie.
- **Audit log**: scrittura diretta dal client, validata dalle regole (`create`-only, `performedBy` == autore della richiesta, `timestamp` == timestamp del server). Garanzia più debole di un Admin SDK trusted (un admin non può falsificare data o azioni altrui, ma il codice client stesso decide quando scrivere la voce, invece di un trigger server sempre eseguito) ma accettabile per un'app di questa scala; in compenso la scrittura combinata (libreria + audit) nello stesso flusso client evita la finestra di inconsistenza che un trigger asincrono avrebbe comunque.
- **Anti-flood chat**: contatore per membro (`msgCount`/`msgWindowStart`) validato dalle regole Firestore. Limite noto e documentato: le regole possono validare che un aggiornamento onesto del contatore sia aritmeticamente corretto, ma non possono obbligare un client a includerlo — un client non standard può quindi bypassare il limite. Accettato perché protegge comunque dall'uso normale/accidentale dell'app, e un limite robusto richiederebbe di nuovo un componente server fidato.

**Alternative considerate**: attivare il piano Blaze (il costo reale sarebbe quasi certamente €0 vista la scala hobby del progetto, ma l'utente preferisce non associare un metodo di pagamento). Scartata su scelta esplicita dell'utente.

## Risks / Trade-offs

- [Dati segnaposto minimi possono nascondere bug di regole complesse (es. multiclassing, incantesimi ad alto livello)] → Documentare chiaramente nei task quali meccaniche restano da validare quando arriveranno i dati completi; scrivere i test di calcolo in modo parametrico così da estendersi facilmente a nuovi dati.
- [Parità funzionale completa (lobby/chat/admin/GDPR) aumenta significativamente la superficie della prima change, con rischio di scope creep] → Strutturare `tasks.md` in fasi indipendenti (core sheet → multiplayer → admin/custom class → compliance) così da poter consegnare e verificare incrementalmente anche all'interno della stessa change.
- [Creazione manuale di progetti Firebase/Vercel può bloccare il deploy se l'utente rimanda questi passi] → I task di setup account sono isolati e chiaramente marcati come "azione manuale utente"; il resto del lavoro (codice, config file) non dipende dal loro completamento per essere sviluppato e testato in locale (emulatori Firebase).
- [Divergenza dei modelli dati da quelli Pathfinder rende impossibile un futuro refactor di codice condiviso tra le due app] → Accettato consapevolmente: sono prodotti indipendenti con regolamenti diversi; non c'è un obiettivo di code-sharing tra i due repo.

## Migration Plan

Non applicabile: `dnd_sheet` non ha stato preesistente da migrare (repository nuovo, nessun utente/dato in produzione). Il rollout consiste nell'inizializzazione diretta del progetto e nel primo deploy su Vercel/Firebase una volta completati i passi manuali di setup account.

## Open Questions

- Nome definitivo del nuovo tema a dominante rossa (proposta in fase di implementazione, es. `crimson`).
- Quali specie/classi/talenti di esempio includere come segnaposto (proposta: Umano e Elfo come specie, Guerriero e Mago come classi, in coerenza con le scelte più comuni già viste in `pathfinder_sheet`) — da confermare o sostituire quando l'utente fornirà indicazioni più precise.
- Se e quando l'utente fornirà i cataloghi completi, valutare se mantenere lo stesso pattern "JSON in `public/data/` per cataloghi grandi" o se il volume di dati D&D 2024 (talenti + incantesimi) giustifichi un approccio diverso (es. Firestore `library` invece di JSON statico anche per i contenuti built-in).
