# TODO — gesammelte Notizen vom Nutzer

Gesammelt aus mehreren Tagen Notizen in der App selbst (Notizen-Tab), am 2026-09-16 übertragen und nach Umsetzungsaufwand sortiert. Bearbeitete Punkte werden hier abgehakt, nicht gelöscht — damit die Historie sichtbar bleibt.

## 🟢 Einfach

- [x] Tab "Tests" umbenennen zu "Tests / Termine"
- [x] "Allgemein"-Kategorie bei Tests ergänzen (analog zu Notizen)
- [x] Icon-Animationen der Bottom-Nav (Pop-Effekt beim aktiv werden) auch für die Desktop-SideNav ergänzen
- [x] Fachschrift im Stundenplan glänzend/neonweiß stylen
- [x] "Anstehende Tests"-Übersicht filtern: nur Termine aus den nächsten 3 Wochen anzeigen (Home-Dashboard-Vorschau)

## 🟡 Mittel

- [ ] Namen, Daten und Notizen bearbeitbar machen — aktuell nur löschen + neu anlegen möglich, kein Edit für bestehende Hausaufgaben/Tests/Notizen (Titel, Fach, Datum, Text)
- [ ] Pause-Funktion im Stundenplan einfügen (Detail noch zu klären: echte Pausen-Zeile im Raster, oder eine "Pause"-Option statt Fach für eine Stunde?)
- [ ] "Nächste Stunde"-Button bei Hausaufgaben: sobald ein Fach ausgewählt ist, füllt ein Button das Fällig-Datum automatisch mit dem nächsten Termin dieses Fachs laut Stundenplan (Beispiel: Mittwoch in Englisch, Fach "Englisch" gewählt → Datum wird automatisch nächster Dienstag)
- [ ] IntroReveal (die ~6-Sek.-Animation direkt nach dem Onboarding) fühlt sich in der zweiten Hälfte wie eingefroren an, weil nach ~2-3 Sek. nichts mehr sichtbar passiert, bis sie ausblendet, und man sie nicht wegklicken kann → durchgehend laufender dünner Fortschrittsbalken über die volle Dauer (analog zum Fortschrittsbalken im Onboarding)

## 🔴 Schwer / größer

- [ ] Foto-Anhänge bei Tests für Lernstoff (Firebase Storage, Upload-UI, Anzeige)
- [ ] Geteilter Stundenplan (analog zur Bubble-Idee für Hausaufgaben) — noch vage, kein konkreter Scope

## Sonstiges

- Das "Bubble"-Feature (geteilte Hausaufgaben) selbst ist separat geplant, siehe `~/.claude/plans/synchronous-waddling-cloud.md` bzw. den Abschnitt dazu in `CLAUDE.md`.
