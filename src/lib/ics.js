// RFC 5545: comma, semicolon, backslash and newlines must be escaped in text values.
function escapeIcs(text) {
  return String(text).replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n')
}

function stamp(d = new Date()) {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

// One all-day VEVENT per item (tests/Termine have a date but no time). `items` need `id`, `date`
// ('YYYY-MM-DD'), `subject`, optional `topic`, optional `kind` ('test' | 'termin').
export function buildIcs(items) {
  const now = stamp()
  const events = items.map((item) => {
    const summary = `${item.subject || 'Allgemein'}${item.topic ? ' – ' + item.topic : ''}${item.kind === 'termin' ? ' (Termin)' : ''}`
    return [
      'BEGIN:VEVENT',
      `UID:${item.id}@schultracker.vercel.app`,
      `DTSTAMP:${now}`,
      `DTSTART;VALUE=DATE:${item.date.replace(/-/g, '')}`,
      `SUMMARY:${escapeIcs(summary)}`,
      'END:VEVENT',
    ].join('\r\n')
  })
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Schultracker//DE', ...events, 'END:VCALENDAR'].join('\r\n')
}

function toBase64Url(text) {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// iOS only offers "Zum Kalender hinzufügen" when the browser navigates directly to a URL serving
// text/calendar — a client-built Blob (download link or Web Share API file) doesn't trigger it,
// and that's even more true for an installed PWA in standalone mode. So instead of generating a
// local file, hand the built .ics text to api/ics.js (a stateless passthrough) and navigate there;
// it re-serves the exact same text with the right Content-Type/-Disposition so Safari recognizes it.
export function openIcsImport(text) {
  window.location.href = `/api/ics?data=${toBase64Url(text)}`
}
