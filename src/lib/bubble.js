import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from './firebase'

const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const MAX_MEMBERS = 3

function generateCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return Array.from(bytes, (b) => CODE_CHARS[b % CODE_CHARS.length]).join('')
}

export function normalizeCode(input) {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export async function createBubble(user, name) {
  for (let i = 0; i < 5; i++) {
    const code = generateCode()
    const ref = doc(db, 'bubbles', code)
    if ((await getDoc(ref)).exists()) continue
    await setDoc(ref, {
      code,
      members: [user.uid],
      memberNames: { [user.uid]: name },
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    })
    await setDoc(doc(db, 'users', user.uid), { bubbleId: code }, { merge: true })
    return code
  }
  throw new Error('code-collision')
}

export async function joinBubble(user, name, rawCode) {
  const code = normalizeCode(rawCode)
  const ref = doc(db, 'bubbles', code)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('not-found')
  const data = snap.data()
  if (!data.members.includes(user.uid)) {
    if (data.members.length >= MAX_MEMBERS) throw new Error('full')
    await updateDoc(ref, {
      members: arrayUnion(user.uid),
      [`memberNames.${user.uid}`]: name,
    })
  }
  await setDoc(doc(db, 'users', user.uid), { bubbleId: code }, { merge: true })
  return code
}

// Removes the user from the bubble's members; the last member out deletes the bubble and its homework.
// Before leaving: own shared projects go back to being private; other people's projects you could see
// stay as read-only archived copies.
async function settleProjects(user, bubbleId) {
  const col = collection(db, 'bubbles', bubbleId, 'projects')
  const found = new Map()
  for (const q of [query(col, where('toAll', '==', true)), query(col, where('visibleTo', 'array-contains', user.uid))]) {
    ;(await getDocs(q)).docs.forEach((d) => found.set(d.id, d))
  }
  for (const d of found.values()) {
    const data = d.data()
    // eslint-disable-next-line no-unused-vars
    const { toAll, visibleTo, ...rest } = data
    const mine = data.ownerUid === user.uid
    await setDoc(doc(db, 'users', user.uid, 'projects', d.id), mine ? rest : { ...rest, archived: true, archivedFrom: data.ownerName || '' })
    if (mine) await deleteDoc(d.ref)
  }
}

export async function leaveBubble(user) {
  const userRef = doc(db, 'users', user.uid)
  const bubbleId = (await getDoc(userRef)).data()?.bubbleId
  if (bubbleId) {
    const ref = doc(db, 'bubbles', bubbleId)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      // Settles (moves to private, or archives) every project the leaving member owns or can see —
      // when they're the last member this is necessarily every project in the bubble, since nothing
      // else could exist without someone to have created/shared it with them.
      await settleProjects(user, bubbleId)
      if (snap.data().members.length <= 1) {
        // 'projects' deliberately excluded here: its read rule requires a per-document condition
        // (toAll or visibleTo), so an unfiltered collection read like the others below is rejected
        // by Firestore outright — regardless of whether any docs remain — and settleProjects above
        // already deleted every one the last member could reach.
        for (const sub of ['homework', 'tests', 'schedules']) {
          const items = await getDocs(collection(ref, sub))
          await Promise.all(items.docs.map((d) => deleteDoc(d.ref)))
        }
        await deleteDoc(ref)
      } else {
        await deleteDoc(doc(ref, 'schedules', user.uid))
        await updateDoc(ref, {
          members: arrayRemove(user.uid),
          [`memberNames.${user.uid}`]: deleteField(),
        })
      }
    }
  }
  await setDoc(userRef, { bubbleId: null }, { merge: true })
}

// Moves the user's own open (not done) private homework into their bubble.
export async function migrateHomework(user, name, bubbleId, items) {
  const target = collection(db, 'bubbles', bubbleId, 'homework')
  for (const { id, subject, title, sketch, dueDate } of items) {
    await addDoc(target, {
      subject: subject ?? null,
      title: title ?? '',
      sketch: sketch ?? null,
      dueDate,
      done: false,
      addedBy: user.uid,
      addedByName: name,
      createdAt: serverTimestamp(),
    })
    await deleteDoc(doc(db, 'users', user.uid, 'homework', id))
  }
}

// Moves the user's own upcoming private tests into their bubble.
export async function migrateTests(user, name, bubbleId, items) {
  const target = collection(db, 'bubbles', bubbleId, 'tests')
  for (const { id, subject, topic, date, photos } of items) {
    await addDoc(target, {
      subject: subject ?? '',
      topic: topic ?? '',
      date,
      photos: photos ?? [],
      addedBy: user.uid,
      addedByName: name,
      createdAt: serverTimestamp(),
    })
    await deleteDoc(doc(db, 'users', user.uid, 'tests', id))
  }
}

// Schedule sharing: a snapshot copy per member at bubbles/{id}/schedules/{uid}.
export async function shareSchedule(user, name, bubbleId, { lessons, breaks, subjects, customColors }) {
  await setDoc(doc(db, 'bubbles', bubbleId, 'schedules', user.uid), {
    ownerName: name,
    lessons: Object.values(lessons).map(({ day, period, subject, room, color }) => ({
      day,
      period,
      subject,
      room: room || '',
      color: color || 'orange',
    })),
    breaks: Object.values(breaks).map(({ afterPeriod, duration }) => ({ afterPeriod, duration })),
    subjects: subjects.map(({ name: n, color }) => ({ name: n, color })),
    customColors: customColors || [],
    sharedAt: serverTimestamp(),
  })
}

export async function unshareSchedule(user, bubbleId) {
  await deleteDoc(doc(db, 'bubbles', bubbleId, 'schedules', user.uid))
}

// Replaces the importer's schedule + breaks with the shared one, and adds any missing subjects/colors.
export async function importSchedule(user, sched, profile, updateUserProfile) {
  for (const sub of ['schedule', 'breaks']) {
    const old = await getDocs(collection(db, 'users', user.uid, sub))
    await Promise.all(old.docs.map((d) => deleteDoc(d.ref)))
  }
  await Promise.all([
    ...sched.lessons.map((l) => setDoc(doc(db, 'users', user.uid, 'schedule', `${l.day}-${l.period}`), l)),
    ...sched.breaks.map((b) => setDoc(doc(db, 'users', user.uid, 'breaks', String(b.afterPeriod)), b)),
  ])
  const ownSubjects = profile?.subjects || []
  const missing = sched.subjects
    .filter((s) => !ownSubjects.some((o) => o.name === s.name))
    .map((s) => ({ id: crypto.randomUUID(), name: s.name, color: s.color }))
  const ownColors = profile?.customColors || []
  const newColors = (sched.customColors || []).filter((c) => !ownColors.some((o) => o.id === c.id))
  if (missing.length || newColors.length) {
    await updateUserProfile({
      subjects: [...ownSubjects, ...missing],
      customColors: [...ownColors, ...newColors],
    })
  }
}
