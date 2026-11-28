---
name: Schultracker
description: Dunkle Schul-App mit Mandarine als Signalfarbe, gebaut für den schnellen Blick zwischen zwei Stunden.
colors:
  mandarine: "#ff7c3a"
  mandarine-hell: "#ffb347"
  mandarine-schleier: "#ff7c3a1a"
  base: "#0a0a0f"
  buehne: "#07060a"
  surface: "#131318"
  surface-2: "#1b1b22"
  border: "#26262f"
  ink: "#f5f4f2"
  ink-dim: "#bcbac2"
  ink-faint: "#85838c"
  rose: "#ff6b81"
  violet: "#a78bfa"
  sky: "#60c7ff"
  mint: "#4ade80"
  yellow: "#facc15"
  slate: "#94a3b8"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 800
    lineHeight: 1.25
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: 1.2
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.33
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.1em"
rounded:
  md: "12px"
  lg: "16px"
  xl: "24px"
  sheet: "28px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "10px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  page: "24px"
components:
  button-primary:
    backgroundColor: "{colors.mandarine}"
    textColor: "#000000"
    rounded: "{rounded.lg}"
    padding: "14px 20px"
  button-secondary:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "14px 20px"
  button-ghost:
    textColor: "{colors.ink-dim}"
    rounded: "{rounded.lg}"
    padding: "14px 20px"
  input:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "14px 16px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "20px"
  list-row:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "16px"
  fab:
    backgroundColor: "{colors.mandarine}"
    textColor: "#000000"
    rounded: "{rounded.full}"
    size: "56px"
  sheet:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.sheet}"
    padding: "16px 24px 32px"
---

# Design System: Schultracker

## Overview

**Creative North Star: "Der Pausen-Blick"**

Alles ist darauf ausgelegt, zwischen zwei Stunden in Sekunden erfasst zu werden: ein Blick, was ansteht, ein Daumentipp, um etwas einzutragen. Dunkle, ruhige Flächen halten den Hintergrund zurück; Mandarine zeigt, wo man handeln kann und wo man gerade ist. Fächerfarben und feste Farben je Eintragsart machen Zeilen erkennbar, bevor man sie liest.

Jede Berührung bekommt eine Antwort. Es soll modern wirken, aber nicht zu viel sein: im Alltag kurze, federnde Rückmeldungen, die große Show nur bei seltenen Momenten (Intro, Logout, Konto löschen, Bubble, Update).

Dieses Dokument beschreibt den Stand von heute, aufgenommen aus dem Code. Es legt ein künftiges neues Design nicht fest.

**Key Characteristics:**
- Dunkler Grund, Mandarine als Signal.
- Große Rundungen und Pillen.
- Flach im Ruhezustand, Tiefe durch Grauschichten und Rahmen.
- Federnde, kurze Reaktionen; getrennt davon wenige große Momente.
- Deutsch in der Du-Form, vereinzelt Emojis.

## Colors

Warmes Orange auf fast schwarzem, leicht bläulichem Grau.

### Primary
- **Mandarine** (`mandarine`): Haupt-Markenfarbe. Hauptaktionen, aktives Nav-Icon, Fokusrahmen von Eingaben, Haken, Zahlen in den Statistik-Kacheln.
- **Helle Mandarine** (`mandarine-hell`): Endpunkt des diagonalen Verlaufs auf Hauptknopf und Plus-Knopf; Funken.
- **Mandarinen-Schleier** (`mandarine-schleier`): zarte Fläche hinter orangen Icons und Etiketten.

### Neutral
- **Base** (`base`): Seitenhintergrund und dunkle Schrift auf farbigen Flächen.
- **Bühne** (`buehne`): Hintergrund der Vollbild-Animationen.
- **Surface** (`surface`): Karten, Listenzeilen, Sheets.
- **Surface 2** (`surface-2`): Eingaben, Sekundärknöpfe, aktive Nav-Pille, Umschalter.
- **Border** (`border`): 1px-Rahmen und Sheet-Griff.
- **Ink / Ink Dim / Ink Faint** (`ink`, `ink-dim`, `ink-faint`): Haupttext, Feldbeschriftungen, Nebeninfos.

### Fach- und Artfarben
- `rose`, `violet`, `sky`, `mint`, `yellow`, `slate` sind zusammen mit den beiden Mandarinen die wählbaren Fächerfarben (`src/lib/constants.js`); Nutzer können eigene ergänzen. Die weiche Variante ist die Farbe mit angehängtem `26`.
- `sky` kennzeichnet auf Home Tests und Termine, `violet` Projekte, Mandarine Hausaufgaben.
- `rose` dient außerdem für Fehler, Löschen und „Gefahrenzone“.

### Named Rules
**Die Signal-Regel.** Mandarine bedeutet „hier handeln“ oder „hier bist du“.

**Die Fach-Regel.** Fächerfarben kommen immer über `colorFor(id, customColors)`, nie fest eingetragen.

## Typography

**Schrift:** Inter (400–800), Fallback `ui-sans-serif, system-ui, sans-serif`.

**Character:** Eine Familie für alles; Hierarchie entsteht durch Größe und Gewicht, Überschriften sehr fett.

Hinweis: „Bricolage Grotesque“ wird geladen und ist als `--font-display` definiert, erscheint aber nirgends. Die Klasse `font-[var(--font-display)]` setzt in Tailwind v4 die Schriftstärke statt der Schriftfamilie. Sichtbar ist überall Inter.

### Hierarchy
- **Display** (800, 2.25rem, eng): persönliche Begrüßung auf Home; Login und Desktop gehen bis 3rem.
- **Headline** (800, 1.875rem; Desktop 2.25rem): Seitentitel.
- **Title** (700, 1.5rem): Sheet-Titel. Abschnittstitel sind kleiner (1.125rem).
- **Body** (400–600, 0.9375rem): Zeilentitel, Knöpfe, Navigation. Nebeninfos 0.75–0.875rem.
- **Label** (600, 0.75rem, versal, weit gesperrt): Kopfzeile der Hero-Karte und ähnliche Vorzeilen; teils bis 10px klein.

### Named Rules
**Die 16px-Regel.** Eingabefelder haben mindestens 16px, sonst zoomt iOS beim Fokus.

## Layout

Mobil zuerst: eine Spalte in voller Höhe (`--app-height`), scrollender Inhalt, darunter die angedockte Bottom-Nav. Ab 768px links eine Seitenleiste (256px, ab 1024px 288px) und Inhalt in zwei Spalten, wo es passt. Listen haben 8–10px Abstand, Karten 16–20px Innenabstand, Abschnitte 24–28px. Feste Elemente oben rechnen `env(safe-area-inset-top)` ein; Seitentitel lassen mobil rechts Platz für das Zahnrad.

Die Struktur der App-Hülle und das Verbot von `overflow-x: hidden` auf `html`, `body`, `#root` sind in `CLAUDE.md` begründet.

## Elevation & Depth

Im Alltag flach: Tiefe entsteht durch die Stufen `base` → `surface` → `surface-2` und 1px-Rahmen.

### Shadow Vocabulary
- **Hauptknopf** (`shadow-lg` in dunklem Orange, 30%): hebt die Hauptaktion ab.
- **Schwebend** (`shadow-xl`, orange 40% bzw. schwarz 40%): Plus-Knopf, Speicher-Toast, Banner.
- **Glut** (`0 0 40px rgba(255,122,48,0.45)` und Varianten): nur in großen Animationen.
- **Verschleierung** (`backdrop-blur`): Bottom-Nav und Sheet-Hintergrund.

### Named Rules
**Die Flach-Regel.** Karten und Zeilen werfen keine Schatten. Leuchten gehört der Hauptaktion, Schwebendem und den großen Momenten.

## Shapes

Weich und rund, ohne scharfe Ecken: Eingaben und kleine Kacheln 12px, Knöpfe und Listenzeilen 16px, Karten und Hero 24px, Sheet oben 28px. Chips, Umschalter, Checkboxen und Plus-Knopf sind voll rund. Ein schmaler runder Farbbalken markiert das Fach in der Hero-Karte.

## Components

Es gibt immer eine Reaktion, modern, aber nie zu viel.

### Buttons
- **Shape:** 16px Radius, 15px halbfett.
- **Primary:** diagonaler Verlauf Mandarine → helle Mandarine, schwarze Schrift, oranger Schatten, Ripple an der Tippstelle.
- **Secondary / Ghost:** `surface-2` mit Rahmen bzw. ohne Fläche in `ink-dim`.
- **States:** Tippen verkleinert auf 0.96; deaktiviert 40% Deckkraft. Eigener Tastaturfokus-Stil ist nicht definiert.

### Chips
- **Fach-Chips:** weiche Fachfarbe mit farbiger Schrift; ausgewählt volle Farbe mit dunkler Schrift.
- **Umschalter:** Pillenleiste in `surface-2`, aktives Segment Mandarine mit schwarzer Schrift.

### Cards / Containers
- Karten: `surface`, Rahmen, 24px, 20px innen.
- Listenzeilen: `surface`, Rahmen, 16px, Wischen nach links legt eine rose Löschfläche frei.
- Hero-Karte: 135°-Verlauf von weicher Fachfarbe nach `surface`.

### Inputs / Fields
- `surface-2`, 1px-Rahmen, 12px; Fokus färbt den Rahmen Mandarine. Beschriftung darüber, 14px in `ink-dim`.

### Navigation
- Bottom-Nav: Icon plus 11px-Text; aktiv mit gleitender `surface-2`-Pille, Mandarine-Icon und kleinem Sprung.
- Seitenleiste: gleiche Logik, 15px-Text.
- Icons: eigene Linien-SVGs, 22px, 2px Strich, runde Enden.

### Sheet
Formulare kommen als Blatt von unten (Feder: damping 32, stiffness 320), schließbar über Hintergrund oder Ziehen am Griff.

### Bewegung
- Alltag: Seitenwechsel 0.28s `cubic-bezier(0.22, 1, 0.36, 1)`; Federn für Pillen, Icons, gestaffeltes Einfliegen von Zeilen; Haken zeichnet sich mit Funken.
- Große Momente: mehrsekündige Vollbild-Sequenzen auf `buehne` mit Partikeln und Glut.
- `prefers-reduced-motion` wird derzeit nicht berücksichtigt.

## Do's and Don'ts

### Do:
- **Do** das Anstehende ohne Suchen sichtbar machen.
- **Do** jeder Berührung eine kurze, sichtbare Antwort geben.
- **Do** die vorhandenen Tokens aus `src/index.css` nutzen.
- **Do** Mandarine als Haupt-Markenfarbe behalten.
- **Do** große Animationen behalten und von kleinem Alltags-Feedback trennen.

### Don't:
- **Don't** Alltagsaktionen mit großer Show aufhalten; es darf nicht zu viel sein.
- **Don't** Karten oder Listenzeilen Schatten geben.
- **Don't** Eingaben unter 16px setzen.
- **Don't** Vollbild-Overlays innerhalb von `PageTransition` rendern.
