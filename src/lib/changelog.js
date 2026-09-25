// Newest first. Add an entry (and bump package.json's version) with every production deploy.
export const CHANGELOG = [
  {
    version: '4.5',
    date: '25.09.2026',
    title: 'Home-Dashboard-Fixes',
    items: [
      'Doppelstunden-Bug behoben: die große Karte zeigte am Übergang zwischen den beiden Hälften (z. B. genau um 10:40) kurz die falsche nächste Stunde',
      'Die Karte aktualisiert sich jetzt jede Minute von selbst, auch wenn die Seite offen bleibt',
    ],
  },
  {
    version: '4.4',
    date: '22.09.2026',
    title: 'Update-Hinweis',
    items: [
      'Neues kleines Banner: erscheint, sobald ein Update von mir offiziell freigegeben ist',
      'Warst du schon automatisch drauf, bekommst du nur eine kurze Info statt eines Knopfs',
    ],
  },
  {
    version: '4.3.3',
    date: '22.09.2026',
    title: 'Kurzer Willkommens-Effekt öfter',
    items: [
      'Der kurze Funken-Effekt beim App-Öffnen erscheint jetzt auch, wenn du die App nur in den Hintergrund geschickt hattest (z. B. Home-Bildschirm), nicht nur nach komplettem Schließen',
      'Kurze Unterbrechungen (kurz weggeschaut, ein Dialog) lösen ihn nicht aus',
    ],
  },
  {
    version: '4.3.2',
    date: '22.09.2026',
    title: 'Dashboard-Feinschliff',
    items: [
      'Kacheln umbenannt: Hausaufgaben, Nächster Test in, Fällig diese Woche (statt der oft leeren Projekt-Zahl)',
      'Die große Karte zeigt jetzt immer die nächste Stunde, auch während des Unterrichts; bei Doppelstunden die übernächste',
      '"Steht an" zeigt nur noch die nächsten 2 Wochen',
      'Hausaufgabe, Test und Projekt sind jetzt farblich und mit Label unterscheidbar',
    ],
  },
  {
    version: '4.3.1',
    date: '22.09.2026',
    title: 'Neues Heute-Dashboard',
    items: [
      'Große Karte zeigt die laufende oder nächste Stunde statt einer langen Liste',
      'Aufgaben, nächster Test und Projekte als schnelle Zahlen',
      '"Steht an": Aufgaben, Tests und Projekt-Abgaben zusammen, nach Dringlichkeit sortiert',
      'Fix: der Plus-Knopf bei Projekte "backte" beim Öffnen kurz oben rechts, jetzt wie überall',
    ],
  },
  {
    version: '4.3',
    date: '21.09.2026',
    title: 'Benachrichtigungen pro Gerät',
    items: [
      'Jedes Gerät hat seine eigenen Einstellungen: an oder aus, Uhrzeiten und Test-Tage',
      'Du siehst deine anderen Geräte und kannst sie ein- oder ausschalten',
      'Die Test-Nachricht geht nur an das Gerät, auf dem du gerade bist',
    ],
  },
  {
    version: '4.2',
    date: '21.09.2026',
    title: 'Projekte',
    items: [
      'Neuer Bereich „Projekte“ für Schulprojekte, mit Aufgaben, wichtigen Daten, Links, einem Foto und Notizen',
      'Projekte mit der ganzen Bubble oder nur mit bestimmten Leuten teilen, Abhaken gilt für alle',
      'Wenn du eine Bubble verlässt, bleiben fremde Projekte als Archiv (nur lesen) bei dir',
      'Abgaben erscheinen auf der Startseite bei den anstehenden Terminen',
    ],
  },
  {
    version: '4.1',
    date: '21.09.2026',
    title: 'Neue Animationen',
    items: [
      'Neuer Start: Funken sammeln sich im Logo, es platzt in Wellen und Funken auf und fliegt nahtlos in den Login-Screen',
      'Dieselbe Animation nach dem Abmelden',
      'Einführung nach der Einrichtung: Logo-Ausbruch, dann fliegen die fünf Bereiche der App ein',
      'Konto löschen: ruhiger Abschied, das Logo löst sich in Funken auf',
      'App aktualisieren: Funken strömen ins Logo, danach landest du direkt bei „Was ist neu“, wo der neueste Eintrag aufleuchtet',
      'Einfliegen mit Glanz auch in Einstellungen, Bubble-Seite und Startseite',
      'Hausaufgabe abhaken und „Gespeichert“ mit kleinen Funken',
      'Bubble erstellen, beitreten und verlassen: glasige Bubble, Funken und die anderen Mitglieder schweben schon darin, wenn du eintauchst',
    ],
  },
  {
    version: '4.0',
    date: '21.09.2026',
    title: 'Das Design-Update',
    items: [
      'Bubble-Seite neu: Code groß und übersichtlich, QR-Code auf Knopfdruck',
      'Teilen-Einstellungen als eigene Karten mit Symbolen',
      'Bubble verlassen ganz unten, dezent',
    ],
  },
  {
    version: '3.7',
    date: '21.09.2026',
    title: 'Teilen, Aufräumen, Stift',
    items: [
      'Bubble: getrennt einstellen, ob du geteilte Tests siehst und ob du deine teilst',
      'Abgehakte Hausaufgaben verschwinden automatisch am Tag nach dem Fälligkeitsdatum',
      'Stift: schnelles Schreiben verliert keine Striche mehr',
    ],
  },
  {
    version: '3.6',
    date: '20.09.2026',
    title: 'Neue Bubble-Optik',
    items: ['Die Bubble sieht jetzt aus wie eine echte, schimmernde Luftblase'],
  },
  {
    version: '3.5',
    date: '20.09.2026',
    title: 'Neue Einstellungen und Versionsanzeige',
    items: [
      'Einstellungen als übersichtliche Liste mit Unterseiten',
      'Versionsnummer und Änderungsliste (das hier)',
      'Neue Lade-Animation mit deinem Logo',
    ],
  },
  {
    version: '3.4',
    date: '20.09.2026',
    title: 'Animationen',
    items: [
      'Bubble erstellen, beitreten und verlassen mit eigener Animation',
      'Animation beim Aktualisieren der App',
    ],
  },
  {
    version: '3.3',
    date: '20.09.2026',
    title: 'Push-Benachrichtigungen',
    items: [
      'Erinnerung an offene Hausaufgaben für morgen',
      'Test-Countdown (z. B. 5 Tage vorher und am Vorabend)',
      'Uhrzeiten einstellbar, optional nur außerhalb der Schulzeit',
      'Eigener Schritt beim Einrichten',
    ],
  },
  {
    version: '3.2',
    date: '19.09.2026',
    title: 'Bubble teilen',
    items: [
      'Tests und Termine mit der Bubble teilen (jeder stellt es für sich ein)',
      'Stundenplan teilen und importieren',
      'Fotos bei Tests',
      'QR-Code und Kamera-Scanner zum Beitreten',
    ],
  },
  {
    version: '3.0',
    date: '19.09.2026',
    title: 'Die Bubble',
    items: [
      'Hausaufgaben mit Freunden teilen, per Code beitreten',
      'Abhaken und Löschen betrifft nur dich, Bearbeiten gilt für alle',
      'Schwebende Bubble mit den Namen aller Mitglieder',
    ],
  },
  {
    version: '2.0',
    title: 'Mehr Komfort',
    items: [
      'Bearbeiten für Hausaufgaben, Tests und Notizen',
      'Pausen im Stundenplan',
      '"Nächste Stunde"-Knopf bei Hausaufgaben',
      'Stift-Modus mit Zurück-Knopf',
      'Abmelden mit Bestätigung und Animation',
    ],
  },
  {
    version: '1.0',
    title: 'Die Grundapp',
    items: ['Stundenplan, Hausaufgaben, Tests und Notizen', 'Fächer mit eigenen Farben', 'Anmeldung und Einrichtung'],
  },
]
