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

// Native share sheet (iOS/Android, installed PWA) when it can take a file, otherwise a plain
// download link (desktop browsers).
export async function shareOrDownloadIcs(filename, text) {
  const file = new File([text], filename, { type: 'text/calendar' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return
    } catch {
      // user cancelled the share sheet, or it failed — fall through to download
    }
  }
  const url = URL.createObjectURL(new Blob([text], { type: 'text/calendar' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
