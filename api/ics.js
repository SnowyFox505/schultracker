// iOS only offers "Zum Kalender hinzufügen" when Safari navigates directly to a URL serving
// text/calendar — not for a client-generated Blob/Web-Share file, and that's true even more so for
// an installed PWA in standalone mode. This stateless endpoint just decodes what the client already
// built (see src/lib/ics.js) and re-serves it with the right headers so the browser recognizes it.
export default function handler(req, res) {
  const data = req.query.data
  if (!data || typeof data !== 'string') return res.status(400).send('Missing data')

  let text
  try {
    text = Buffer.from(data, 'base64url').toString('utf-8')
  } catch {
    return res.status(400).send('Invalid data')
  }

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
  res.setHeader('Content-Disposition', 'inline; filename="schultracker-termine.ics"')
  res.status(200).send(text)
}
