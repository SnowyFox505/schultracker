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
- [~] Push-Benachrichtigungen (gebaut: Erlaubnis-Knopf, Einstellungen, Server; offen: Onboarding-Schritt, Firebase/Vercel/cron-job.org-Setup durch Nutzer) (braucht Firebase Cloud Messaging + Service-Worker-Erweiterung + Backend/Functions für zeitgesteuerten Versand):
  - Abend-Check ~18:00 Uhr: erinnert nur, wenn für morgen noch offene Hausaufgaben da sind (bleibt still, wenn alles erledigt ist)
  - Test-Countdown: gestufte Erinnerung, z.B. 5 Tage vorher + nochmal am Vorabend
  - Gezielter Einzelversand über individuelle Geräte-Token, damit z.B. nur die Person mit der vergessenen Aufgabe benachrichtigt wird, nicht die ganze Bubble

- [x] Bubble-Optik: die Bubble als schöne orange "Luftblase" darstellen, in der die Namen aller Mitglieder herumschweben (animiert, siehe Animations-Tiers in CLAUDE.md)
- [x] Bubble eigene Unterseite: alles rund um die Bubble (erstellen/beitreten/Mitglieder/verlassen, spätere Bubble-Einstellungen) aus den Einstellungen in eine neue Seite "Bubble" verschieben (Route + Nav-Eintrag)

## Sonstiges

- Bubble v1 ist gebaut (Hausaufgaben teilen per Code); Verlassen/Account-Löschen räumen auf; QR-Beitritt gebaut; Migration alter Hausaufgaben gebaut.

- Das "Bubble"-Feature (geteilte Hausaufgaben) selbst ist separat geplant, siehe `~/.claude/plans/synchronous-waddling-cloud.md` bzw. den Abschnitt dazu in `CLAUDE.md`. Die neuen Bubble-Erweiterungsideen (QR-Beitritt, Push-Benachrichtigungen) oben sind spätere Ausbaustufen davon, nicht Teil des ursprünglichen v1-Scopes.
