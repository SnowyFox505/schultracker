import { adminAuth, sendToUser } from './_lib/admin.js'

export default async function handler(req, res) {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '')
    const { uid } = await adminAuth.verifyIdToken(token)
    const sent = await sendToUser(uid, {
      title: 'Schultracker',
      body: 'Test-Nachricht: Benachrichtigungen funktionieren ✓',
      url: '/einstellungen',
    })
    res.status(200).json({ sent })
  } catch {
    res.status(401).json({ error: 'unauthorized' })
  }
}
