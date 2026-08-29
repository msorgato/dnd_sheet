# dnd_sheet

Web app per creare e gestire schede personaggio D&D, basata sul regolamento di 5ª edizione con le integrazioni introdotte da D&D 2024 (One D&D revised).

Progetto gemello di [`pathfinder_sheet`](../pathfinder_sheet): stessa architettura e stesse funzionalità (creazione guidata, scheda completa, lobby multiplayer con chat, editor di classi custom, gestione account), ma con regole, terminologia e contenuti propri di D&D anziché Pathfinder.

## Stack tecnico

- React 19 + TypeScript, build con Vite 8
- Tailwind CSS v4 (theming via variabili CSS, nessun `tailwind.config.js`)
- Zustand per lo stato applicativo
- `react-router-dom` v7 per il routing
- Firebase (Authentication, Firestore, Cloud Functions) come backend
- Vercel per l'hosting del frontend
- Vitest per i test unitari e delle regole Firestore

## Setup locale

1. Installa le dipendenze:
   ```
   npm install
   ```
2. Copia `.env.example` in `.env` e compila le variabili `VITE_FIREBASE_*` con i valori del tuo progetto Firebase (Firebase Console → Project Settings → Your Apps → Web App).
3. Avvia il server di sviluppo:
   ```
   npm run dev
   ```

## Sviluppo locale con gli emulatori Firebase (senza un progetto reale)

Per provare l'app senza creare un progetto Firebase, usa gli emulatori locali di Auth e Firestore:

1. Nel `.env`, imposta `VITE_USE_FIREBASE_EMULATORS=true` e lascia le altre variabili `VITE_FIREBASE_*` con valori segnaposto non vuoti, ad esempio:
   ```
   VITE_FIREBASE_API_KEY=demo-api-key
   VITE_FIREBASE_AUTH_DOMAIN=dnd-sheet-test.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=dnd-sheet-test
   VITE_FIREBASE_STORAGE_BUCKET=dnd-sheet-test.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
   VITE_FIREBASE_APP_ID=1:000000000000:web:0000000000000000000000
   VITE_USE_FIREBASE_EMULATORS=true
   ```
2. Avvia gli emulatori Auth e Firestore in un terminale separato:
   ```
   firebase emulators:start --only auth,firestore --project dnd-sheet-test
   ```
   La UI degli emulatori è disponibile su `http://127.0.0.1:4000`.
3. In un altro terminale, avvia l'app:
   ```
   npm run dev
   ```
4. Vai su `http://localhost:5173/login` e clicca "Accedi con Google": l'emulatore Auth intercetta la richiesta e mostra una UI locale per creare un utente di test fittizio (nessuna credenziale reale necessaria).
5. Per diventare admin (necessario per il pannello `/admin`), crea manualmente il documento `users/{tuo-uid}/settings/profile` con `{ role: 'admin' }` dalla UI Firestore dell'emulatore (`http://127.0.0.1:4000/firestore`).

Audit log, cancellazione account e limite anti-flood dei messaggi sono implementati interamente lato client + regole di sicurezza Firestore (nessuna Cloud Function, per restare sul piano gratuito Spark). Il limite anti-flood è "debole": impedisce l'uso normale/accidentale ma non un client modificato che ometta l'aggiornamento del proprio contatore (vedi commenti in `firestore.rules`).

## Script disponibili

- `npm run dev` — avvia il server di sviluppo Vite
- `npm run build` — type-check (`tsc -b`) e build di produzione
- `npm run lint` — esegue ESLint
- `npm run test` — esegue i test unitari con Vitest
- `npm run test:watch` — esegue i test unitari in watch mode
- `npm run test:rules` — esegue i test delle regole di sicurezza Firestore (richiede l'emulatore Firestore attivo, vedi sotto)

## Test delle regole Firestore

I test in `tests/firestore.rules.test.ts` usano `@firebase/rules-unit-testing` contro l'emulatore Firestore locale:

1. Avvia l'emulatore in un terminale separato:
   ```
   firebase emulators:start --only firestore
   ```
2. In un altro terminale, esegui:
   ```
   npm run test:rules
   ```

## Hosting

Il frontend è pensato per essere ospitato su **Vercel** (SPA, rewrite verso `index.html`), mentre **Firebase** fornisce Authentication e Firestore (piano gratuito Spark, nessuna Cloud Function). Repository GitHub: `msorgato/dnd_sheet`.

## Stato del contenuto di gioco

I dati di specie, classi, talenti e incantesimi inclusi in questa fase sono un set minimo segnaposto, sufficiente a validare wizard e scheda personaggio. I cataloghi completi e ufficiali del regolamento D&D 2024 verranno aggiunti in change successive.
