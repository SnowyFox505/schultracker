import { adminDb, sendToDevices } from './_lib/admin.js'

const TZ = 'Europe/Berlin'
const PERIODS = [
  ['08:00', '08:45'],
  ['08:50', '09:35'],
  ['09:55', '10:40'],
  ['10:45', '11:30'],
  ['11:45', '12:30'],
  ['12:35', '13:20'],
  ['13:30', '14:15'],
  ['14:20', '15:05'],
]
const DAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
const LATEST_MINUTES = 23 * 60 // never send later than 23:00

function berlinNow() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      weekday: 'short',
    })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value])
  )
  const weekdayIdx = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday)
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
    weekday: DAYS[weekdayIdx],
  }
}

function addDays(iso, n) {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))

async function inLesson(uid, now) {
  const snap = await adminDb.collection('users').doc(uid).collection('schedule').where('day', '==', now.weekday).get()
  return snap.docs.some((d) => {
    const range = PERIODS[d.data().period - 1]
    return range && now.minutes >= toMin(range[0]) && now.minutes < toMin(range[1])
  })
}

// Personal items plus (if shared) the bubble's, minus what this user hid or checked off.
async function collect(uid, profile, name, field, value) {
  const personal = await adminDb.collection('users').doc(uid).collection(name).where(field, '==', value).get()
  let items = personal.docs.map((d) => ({ id: d.id, ...d.data() }))
  const seeTests = profile.seeTests ?? !!profile.shareTests
  if (profile.bubbleId && (name === 'homework' || seeTests || profile.shareTests)) {
    const shared = await adminDb.collection('bubbles').doc(profile.bubbleId).collection(name).where(field, '==', value).get()
    const states = await adminDb.collection('users').doc(uid).collection('bubbleState').get()
    const st = Object.fromEntries(states.docs.map((d) => [d.id, d.data()]))
    items = items.concat(
      shared.docs
        .filter((d) => name === 'homework' || seeTests || d.data().addedBy === uid)
        .filter((d) => !st[d.id]?.hidden && !(name === 'homework' && st[d.id]?.done))
        .map((d) => ({ id: d.id, ...d.data() }))
    )
  }
  return items
}

// Per-device settings (users/{uid}/devices/{id}.prefs) override the account defaults (users/{uid}.push).
function prefsFor(accountPush = {}, devicePrefs = {}) {
  return {
    homework: { on: true, time: '18:00', ...accountPush.homework, ...devicePrefs.homework },
    tests: { on: true, time: '18:00', days: [5, 1], ...accountPush.tests, ...devicePrefs.tests },
    skipSchool: (devicePrefs.skipSchool ?? accountPush.skipSchool) !== false,
  }
}

export default async function handler(req, res) {
  if (req.query.secret !== process.env.CRON_SECRET) return res.status(401).json({ error: 'unauthorized' })

  const now = berlinNow()
  const users = await adminDb.collection('users').where('push.enabled', '==', true).get()
  let sent = 0

  for (const userDoc of users.docs) {
    const uid = userDoc.id
    const profile = userDoc.data()
    const devices = await userDoc.ref.collection('devices').get()
    const lessonCache = {}
    const itemsCache = {}
    const inLessonNow = async () => (lessonCache.v ??= await inLesson(uid, now))
    const items = async (name, field, value) => (itemsCache[`${name}|${value}`] ??= await collect(uid, profile, name, field, value))

    for (const deviceDoc of devices.docs) {
      const device = deviceDoc.data()
      // devices from before per-device settings have no `enabled` flag: they follow the account switch
      if (!device.token || (device.enabled ?? !!profile.push?.enabled) === false) continue
      const prefs = prefsFor(profile.push, device.prefs)
      const already = device.pushSent || profile.pushSent || {}
      const marks = {}

      // A notification is "due" once its time has passed today (catch-up, so a 15-min cron
      // granularity never misses it) and, if enabled, only while no lesson is running.
      const due = async (time) => {
        if (now.minutes < toMin(time || '18:00') || now.minutes > LATEST_MINUTES) return false
        if (prefs.skipSchool && (await inLessonNow())) return false
        return true
      }
      const send = (payload) => sendToDevices([deviceDoc], payload)

      if (prefs.homework.on) {
        const key = `hw-${now.date}`
        if (!already[key] && (await due(prefs.homework.time))) {
          const open = (await items('homework', 'dueDate', addDays(now.date, 1))).filter((h) => !h.done)
          if (open.length) {
            sent += await send({
              title: 'Hausaufgaben für morgen',
              body: open.length === 1 ? '1 Hausaufgabe ist noch offen.' : `${open.length} Hausaufgaben sind noch offen.`,
              url: '/hausaufgaben',
            })
          }
          marks[key] = true
        }
      }

      if (prefs.tests.on) {
        for (const days of prefs.tests.days) {
          const key = `t${days}-${now.date}`
          if (already[key] || !(await due(prefs.tests.time))) continue
          for (const t of await items('tests', 'date', addDays(now.date, days))) {
            sent += await send({
              title: days === 1 ? 'Morgen: Test' : `Test in ${days} Tagen`,
              body: `${t.subject || 'Termin'}${t.topic ? ` – ${t.topic}` : ''}`,
              url: '/pruefungen',
            })
          }
          marks[key] = true
        }
      }

      if (Object.keys(marks).length) {
        // keep only the last 14 days of marks so the map doesn't grow forever
        const cutoff = addDays(now.date, -14)
        const kept = Object.fromEntries(Object.entries(already).filter(([k]) => k.slice(-10) >= cutoff))
        await deviceDoc.ref.update({ pushSent: { ...kept, ...marks } })
      }
    }
  }

  res.status(200).json({ ok: true, sent })
}
