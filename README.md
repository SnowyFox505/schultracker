# Schultracker

Stundenplan, Hausaufgaben, Notizen und Tests – als installierbare Web-App (PWA) fürs iPad.

## Stack

- React + Vite (PWA via `vite-plugin-pwa`)
- Tailwind CSS + Framer Motion
- Firebase Auth + Firestore (kostenloser Spark-Plan)
- Hosting: Vercel

## Firebase einrichten (einmalig)

1. Auf [console.firebase.google.com](https://console.firebase.google.com) ein neues Projekt anlegen.
2. Im Projekt: **Build → Authentication → Get started** → Anbieter **E-Mail/Passwort** aktivieren.
3. **Build → Firestore Database → Create database** → im **production mode** starten.
4. In Firestore unter **Regeln** den Inhalt von [`firestore.rules`](./firestore.rules) einfügen und veröffentlichen (sorgt dafür, dass jede:r nur die eigenen Daten sieht).
5. **Projekteinstellungen → Allgemein → Meine Apps → Web-App hinzufügen** (</> Icon). Du bekommst dann ein Config-Objekt mit `apiKey`, `authDomain`, usw.
6. Diese Werte in eine `.env`-Datei im Projekt-Root eintragen (Vorlage: `.env.example`):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## Lokal starten

```bash
npm install
npm run dev
```

## Deploy auf Vercel

1. Repo auf GitHub pushen.
2. Auf [vercel.com](https://vercel.com) das Repo importieren (erkennt Vite automatisch).
3. Die gleichen `VITE_FIREBASE_*` Variablen unter **Project Settings → Environment Variables** eintragen.
4. Deploy. Auf dem iPad die Vercel-URL öffnen → über den Teilen-Button **"Zum Home-Bildschirm"** hinzufügen → läuft wie eine native App.
