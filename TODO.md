# TODO — gesammelte Notizen vom Nutzer

Gesammelt aus mehreren Tagen Notizen in der App selbst (Notizen-Tab), am 2026-09-16 übertragen und nach Umsetzungsaufwand sortiert. Bearbeitete Punkte werden hier abgehakt, nicht gelöscht — damit die Historie sichtbar bleibt.

## 🐛 Bugs

- [x] Stundenplan lässt sich auf dem Handy nicht vertikal scrollen, dadurch ist die 8. Stunde nicht erreichbar — behoben durch `touch-pan-y` zusätzlich zu `touch-pan-x` auf dem Grid-Container (`touch-action: pan-x pan-y` statt nur `pan-x`), sodass horizontales UND vertikales Touch-Scrollen wieder beide funktionieren.

## 🟢 Einfach

- [x] Tab "Tests" umbenennen zu "Tests / Termine"
- [x] "Allgemein"-Kategorie bei Tests ergänzen (analog zu Notizen)
- [x] Icon-Animationen der Bottom-Nav (Pop-Effekt beim aktiv werden) auch für die Desktop-SideNav ergänzen
- [x] Fachschrift im Stundenplan glänzend/neonweiß stylen
- [x] "Anstehende Tests"-Übersicht filtern: nur Termine aus den nächsten 3 Wochen anzeigen (Home-Dashboard-Vorschau)

## 🟡 Mittel

- [x] Namen, Daten und Notizen bearbeitbar machen — Hausaufgaben/Tests/Notizen sind jetzt per Tap auf die Zeile bearbeitbar (Titel, Fach, Datum, Text)
- [x] Pause-Funktion im Stundenplan — eigene wochenweite Pausen-Zeile zwischen zwei Stunden (nicht als Fach in einer einzelnen Zelle), mit einstellbarer Dauer in Minuten, gilt für alle Wochentage
- [x] "Nächste Stunde"-Button bei Hausaufgaben — füllt das Fällig-Datum automatisch mit dem nächsten Termin des gewählten Fachs laut Stundenplan
- [x] IntroReveal-Fortschrittsbalken — durchgehend laufender Balken über die volle ~6-Sek.-Dauer statt der ausblendenden Deko-Linie
- [x] "Heute"-Board auf dem Home-Dashboard: sobald die letzte Stunde des Tages (zeitlich) vorbei ist, zeigt der Block automatisch schon "Morgen" mit den Stunden des nächsten Tages statt der (dann irrelevanten) heutigen

## 🔴 Schwer / größer

- [x] Foto-Anhänge bei Tests — ohne Firebase Storage: Fotos werden im Browser auf ~180 KB verkleinert und als `photos`-Array im Test-Dokument gespeichert (max. 4). Falls Qualität zu schlecht: wieder entfernen oder Limits in `src/lib/imageCompress.js` anpassen
- [x] Geteilter Stundenplan (gebaut als Kopie-zum-Importieren in der Bubble, plus Tests-Toggle) (analog zur Bubble-Idee für Hausaufgaben, ggf. auch per Code teilbar) — noch vage, kein konkreter Scope
- [ ] Bubble: Beitritt per QR-Code (App generiert QR-Code für den eigenen Bubble-Code, Kumpel scannt ihn z.B. mit dem iPad und tritt sofort bei) — Erweiterung des bestehenden code-basierten Beitritts, nicht Ersatz
- [ ] Bubble: Echtzeit-Sync ist im bestehenden Plan (`onSnapshot`) eigentlich schon "gratis" enthalten — beim Umsetzen der Bubble explizit gegenprüfen/hervorheben, dass neue Hausaufgaben ohne Verzögerung bei allen Mitgliedern auftauchen
- [ ] Offline-First-Modus (IndexedDB-Cache, damit Hausaufgaben auch ganz ohne Netz eingetragen werden können und im Hintergrund synchronisieren, sobald wieder Verbindung da ist) — großer Architektur-Einschnitt, vorher Plan+Absprache nötig
- [x] Apple-Pencil-Notizfeld — beim Hinzufügen/Bearbeiten von Hausaufgaben und Notizen per Text/Stift-Umschalter wählbar; Zeichenfeld statt Textfeld (nur per Apple Pencil, Finger wird ignoriert, siehe CLAUDE.md), Skizze wird als kleines Vorschaubild in der Liste angezeigt, plus "Zurück"-Button (max. 6x rückgängig)
- [ ] Split-View/Drag-and-Drop auf iPad — Layout passt sich an geteilten Bildschirm an; Fotos (z.B. vom Tafelbild) per Drag-and-Drop in eine Hausaufgabe ziehbar
- [x] Push-Benachrichtigungen (Erlaubnis-Knopf, Einstellungen, Onboarding-Schritt, Server + cron-job.org laufen; gezielter Einzelversand bewusst nicht gebaut) (braucht Firebase Cloud Messaging + Service-Worker-Erweiterung + Backend/Functions für zeitgesteuerten Versand):
  - Abend-Check ~18:00 Uhr: erinnert nur, wenn für morgen noch offene Hausaufgaben da sind (bleibt still, wenn alles erledigt ist)
  - Test-Countdown: gestufte Erinnerung, z.B. 5 Tage vorher + nochmal am Vorabend
  - Gezielter Einzelversand über individuelle Geräte-Token, damit z.B. nur die Person mit der vergessenen Aufgabe benachrichtigt wird, nicht die ganze Bubble

- [x] Bubble-Optik: die Bubble als schöne orange "Luftblase" darstellen, in der die Namen aller Mitglieder herumschweben (animiert, siehe Animations-Tiers in CLAUDE.md)
- [x] Bubble eigene Unterseite: alles rund um die Bubble (erstellen/beitreten/Mitglieder/verlassen, spätere Bubble-Einstellungen) aus den Einstellungen in eine neue Seite "Bubble" verschieben (Route + Nav-Eintrag)

- [x] Bubble-Design überarbeiten: statt einer einfachen orangenen Kugel eine echte, schöne Luftblase (leicht übertrieben, aber nicht 1:1 kopiert) — glasig/durchscheinend, schimmernde Regenbogen-Reflexe an den Rändern, weiche Glanzlichter, warmer orangener Glow drumherum, ein paar kleine Bläschen in der Nähe; Namen schweben weiter darin (`BubbleOrb.jsx`)

## Neu aus den App-Notizen (21.09.2026)

- [x] (4.0) Login-Screen-Übergang: beim ersten Öffnen ohne Anmeldung z. B. schwarzer Bildschirm, der wie eine Wasserwelle weggeht und in ein bestehendes Element des Login-Screens übergeht (Logo/Karte) — allgemein: Übergänge sollen in ein vorhandenes Objekt übergehen statt nur wegzufaden
- [x] (4.3.3) Lade-Animation bei jedem App-Öffnen: löst jetzt auch beim Zurückkehren aus dem Hintergrund aus (Page-Visibility-API, ab 20s weg), nicht nur nach komplettem Schließen
- [x] (4.4, einfache Variante statt echtem Staging) Update-Banner: erscheint erst, wenn Leopold es über "Was ist neu" -> Entwickler-Bereich explizit freigibt (`meta/rollout` in Firestore, nur sein Account darf schreiben). Wer noch die alte Version hat: Banner mit "Aktualisieren"-Knopf. Wer durch den Service-Worker automatisch schon die neue hat: nur ein Info-Banner "App wurde automatisch aktualisiert", kein Knopf nötig
- [ ] (Versuch 1 in 3.8, opaker Streifen: hat nichts gebracht, in 3.9 entfernt) iOS 27 Top-Bar-Blur (Liquid-Glass-Verwischung oben in installierten PWAs): bekannter iOS-Bug, kein sicherer Fix. Möglicher Workaround: `black-translucent` → `default` in index.html + 1px-Sampler-Element mit Hintergrundfarbe oben (Nachteil: Statusleiste nicht mehr randlos, App muss neu zum Home-Bildschirm hinzugefügt werden). Zuerst abwarten/testen
- [x] (3.7) Tests/Termine in der Bubble: den einen Toggle in zwei aufteilen — "Geteilte Termine sehen" und "Meine Termine teilen", jeder entscheidet beides für sich
- [x] (4.3) Push-Einstellungen pro Gerät statt pro Account (z. B. Handy andere Zeiten als iPad) — aktuell pro Account
- [x] (4.2) Neuer "Projekte"-Tab: abgetrennter Bereich pro Schulprojekt (z. B. Deutsch-Präsentation, Film) mit eigenen Notizen, ein paar wichtigen Daten und Links
- [x] (3.7) Abgehakte Hausaufgaben verschwinden automatisch ab 0 Uhr am Tag NACH dem Fälligkeitsdatum (Fach ist heute → ab morgen weg); nur für die eigene Ansicht, unabgehakte bleiben
- [x] (3.7) Stift/Handschrift überarbeiten: bei schnellem Schreiben fehlt oft jeder zweite Strich

- [x] (4.3.1) Neues Heute-Dashboard: Hero-Karte für die aktuelle/nächste Stunde, Statistik-Kacheln, kombinierte "Steht an"-Liste statt Projekte immer ganz unten
- [x] (4.5) Doppelstunden-Grenzfall auf Home behoben (falsche nächste Stunde exakt am Übergang zweier Hälften) + Karte aktualisiert sich jetzt minütlich von selbst

## Neu aus den App-Notizen (25.09.2026)

- [x] (4.6) Schulschluss-Zeit pro Wochentag im Stundenplan (Bearbeiten) einstellbar — ersetzt die abgeleitete Logik für Home-Karte und Push-Erinnerungen, wenn gesetzt

## Neu aus den App-Notizen (29.09.2026)

- [x] (4.7) Bei Tests/Terminen auswählbar: "Test" oder "Termin" — die "Nächster Test in"-Kachel auf Home zählt jetzt nur noch echte Tests, keine allgemeinen Termine mehr
- [x] (4.8) Echte Stundenzeiten statt geratener fester Zeittabelle: Schulstart im Stundenplan einstellbar, Zeiten werden daraus + den Pausen berechnet. Zusätzlich Fix: Heute-Karte zeigte fälschlich "nichts mehr heute"/sprang auf morgen, obwohl man noch in der letzten Stunde des Tages saß

## Sonstiges

- Bubble v1 ist gebaut (Hausaufgaben teilen per Code); Verlassen/Account-Löschen räumen auf; QR-Beitritt gebaut; Migration alter Hausaufgaben gebaut.

- Das "Bubble"-Feature (geteilte Hausaufgaben) selbst ist separat geplant, siehe `~/.claude/plans/synchronous-waddling-cloud.md` bzw. den Abschnitt dazu in `CLAUDE.md`. Die neuen Bubble-Erweiterungsideen (QR-Beitritt, Push-Benachrichtigungen) oben sind spätere Ausbaustufen davon, nicht Teil des ursprünglichen v1-Scopes.
