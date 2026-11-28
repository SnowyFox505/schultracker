# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Schülerinnen und Schüler an Leopolds Schule: er selbst, seine Freunde und darüber hinaus die Klasse bzw. Schule. Wer dazukommt, wird nicht persönlich eingewiesen und muss allein zurechtkommen.

Genutzt wird vor allem die installierte Home-Bildschirm-App auf dem iPhone (Safari), teils auf dem iPad mit Apple Pencil, daneben im Desktop-Browser. Typische Aufgaben: nachsehen, was als Nächstes ansteht, und zwischendurch Hausaufgaben, Tests, Termine oder Notizen eintragen.

## Product Purpose

Der Schulalltag in einer App: Stundenplan, Hausaufgaben, Tests und Termine, Notizen und Projekte. Erfolg heißt: Man sieht auf einen Blick, was ansteht, hat etwas in Sekunden eingetragen und kann sich die Arbeit mit anderen teilen.

## Positioning

- **Alles an einem Ort:** Die Bereiche greifen ineinander. Der Stundenplan bestimmt die nächste Stunde und das Fälligkeitsdatum „nächste Stunde“, Home bündelt, was ansteht.
- **Teilen in der Bubble:** Einer trägt ein, alle in der Bubble haben es. Abhaken und Ausblenden bleiben dabei persönlich (bei Projekten ist der Fortschritt gemeinsam).
- **Schnell erfasst:** Zwischen zwei Stunden eintragen und nachschauen.

## Operating Context

- Kurze Nutzungsmomente im Schulalltag, meist am Handy, einhändig und nebenbei.
- Stundenzeiten werden aus Schulstart (Standard 07:50), 45-Minuten-Stunden und eingetragenen Pausen berechnet; pro Wochentag kann ein Schulschluss gesetzt werden.
- Die App wird laufend weiterentwickelt; Änderungen stehen in der App unter „Was ist neu“.

## Capabilities and Constraints

- Funktionen: Home-Übersicht, Stundenplan, Hausaufgaben, Tests/Termine (Fotos, `.ics`-Export), Notizen (Text oder Handschrift), Projekte, Bubble (Beitritt per Code oder QR-Code), Push-Erinnerungen, eigene Fächerfarben.
- Eine Bubble hat höchstens 3 Mitglieder (Code und Firestore-Regeln).
- Begriffe: „Bubble“ (exakt so), „Steht an“, „Tests / Termine“, „Fächer“.
- Technik: React-PWA (Vite, Tailwind, Framer Motion), Firebase Auth und Firestore, Deployment auf Vercel. Offline-Cache vorhanden.
- Push funktioniert auf iOS nur in der installierten App.
- Safari-Standalone-Verhalten muss auf echten Geräten geprüft werden (Details in `CLAUDE.md`).
- Offen: wie die Nutzung durch eine ganze Klasse zur Bubble-Grenze von 3 passt.
- Offen: Ferien/Feiertage, Notenverwaltung, Wochenansicht und Vertretungsplan sind Ideen aus `TODO.md`, noch nicht gebaut.

## Brand Commitments

- Name: **Schultracker**.
- **Orange ist die Haupt-Markenfarbe.**
- **Große Animationen** (Intro, Logout, Bubble- und Update-Effekte) gehören zur App und bleiben.
- Sprache: **Deutsch, Du-Form**, locker.
- Das heutige dunkle Erscheinungsbild wurde nicht als verbindlich festgelegt.
- Entwickler-Hinweis in den Einstellungen: „Developer: Leopold N.“

## Evidence on Hand

- Live-App: https://schultracker.vercel.app
- App-Icons: `public/icons/`
- Versionshistorie: `src/lib/changelog.js`
- Keine Nutzerzahlen, Zitate oder Bewertungen vorhanden; nichts davon erfinden.

## Product Principles

1. Das Anstehende zuerst: Der aktuelle Stand ist ohne Suchen sichtbar.
2. Eintragen dauert Sekunden.
3. Neue Leute kommen ohne Erklärung zurecht.
4. Geteilt wird der Inhalt, persönlich bleibt der eigene Fortschritt (außer bei gemeinsamen Projekten).
5. Was auf dem echten iPhone nicht funktioniert, gilt als nicht fertig.
