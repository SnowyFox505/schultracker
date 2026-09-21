import { useEffect, useMemo, useState } from 'react'
import { collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where, addDoc } from 'firebase/firestore'
import { db } from './firebase'
import { useAuth } from '../context/AuthContext'

// A project is one document: { name, emoji, color, dueDate, tasks[], dates[], links[], notes, photo, ownerUid, ownerName }.
// Private ones live in users/{uid}/projects. Shared ones live in bubbles/{id}/projects with
// `toAll` (whole bubble) and `visibleTo` (uids that may see it). Everyone with access edits everything;
// only the owner deletes or changes who can see it. Others can hide it for themselves.
// Projects of someone else that you lose access to (you left the bubble) stay behind as read-only
// copies (`archived: true`).

const clientOnly = (p) => {
  // eslint-disable-next-line no-unused-vars
  const { id, shared, ...rest } = p
  return rest
}

export function useProjects() {
  const { user, profile } = useAuth()
  const bubbleId = profile?.bubbleId || null
  const [personal, setPersonal] = useState(null)
  const [sharedAll, setSharedAll] = useState([])
  const [sharedMine, setSharedMine] = useState([])
  const [states, setStates] = useState({})

  useEffect(() => {
    if (!user) return
    return onSnapshot(collection(db, 'users', user.uid, 'projects'), (snap) =>
      setPersonal(snap.docs.map((d) => ({ id: d.id, ...d.data(), shared: false })))
    )
  }, [user])

  useEffect(() => {
    if (!user) return
    return onSnapshot(collection(db, 'users', user.uid, 'bubbleState'), (snap) => {
      const map = {}
      snap.docs.forEach((d) => (map[d.id] = d.data()))
      setStates(map)
    })
  }, [user])

  useEffect(() => {
    if (!user || !bubbleId) return
    const col = collection(db, 'bubbles', bubbleId, 'projects')
    const map = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data(), shared: true }))
    const u1 = onSnapshot(query(col, where('toAll', '==', true)), (s) => setSharedAll(map(s)), () => setSharedAll([]))
    const u2 = onSnapshot(query(col, where('visibleTo', 'array-contains', user.uid)), (s) => setSharedMine(map(s)), () => setSharedMine([]))
    return () => {
      u1()
      u2()
      setSharedAll([])
      setSharedMine([])
    }
  }, [user, bubbleId])

  const items = useMemo(() => {
    const byId = new Map()
    ;(personal || []).forEach((p) => byId.set(p.id, p))
    if (bubbleId) [...sharedAll, ...sharedMine].forEach((p) => !states[p.id]?.hidden && byId.set(p.id, p))
    return [...byId.values()].sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999') || a.name.localeCompare(b.name))
  }, [personal, sharedAll, sharedMine, states, bubbleId])

  const colFor = (isShared) => (isShared ? collection(db, 'bubbles', bubbleId, 'projects') : collection(db, 'users', user.uid, 'projects'))

  async function add(data) {
    const ref = await addDoc(colFor(false), {
      tasks: [],
      dates: [],
      links: [],
      notes: '',
      photo: null,
      ...data,
      ownerUid: user.uid,
      ownerName: profile?.name || '',
      createdAt: serverTimestamp(),
    })
    return ref.id
  }

  const update = (project, patch) => updateDoc(doc(colFor(project.shared), project.id), patch)

  async function remove(project) {
    if (project.shared && project.ownerUid !== user.uid) {
      return setDoc(doc(db, 'users', user.uid, 'bubbleState', project.id), { hidden: true }, { merge: true })
    }
    return deleteDoc(doc(colFor(project.shared), project.id))
  }

  // mode: 'private' | 'all' | 'some' (with uids). Only for projects you own.
  async function setSharing(project, mode, uids = []) {
    if (!bubbleId) return
    const data = clientOnly(project)
    if (mode === 'private') {
      if (!project.shared) return
      delete data.toAll
      delete data.visibleTo
      await setDoc(doc(colFor(false), project.id), data)
      await deleteDoc(doc(colFor(true), project.id))
      return
    }
    const flags = { toAll: mode === 'all', visibleTo: mode === 'all' ? [] : Array.from(new Set([user.uid, ...uids])) }
    if (project.shared) return updateDoc(doc(colFor(true), project.id), flags)
    await setDoc(doc(colFor(true), project.id), { ...data, ...flags })
    await deleteDoc(doc(colFor(false), project.id))
  }

  return { items, loading: personal === null, add, update, remove, setSharing, bubbleId }
}

export function sharingMode(project) {
  if (!project.shared) return 'private'
  return project.toAll ? 'all' : 'some'
}

export function progress(project) {
  const total = (project.tasks || []).length
  const done = (project.tasks || []).filter((t) => t.done).length
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 }
}

export function daysUntil(iso) {
  if (!iso) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(iso)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - today) / 86400000)
}

export function dueLabel(iso) {
  const d = daysUntil(iso)
  if (d === null) return 'Kein Abgabedatum'
  if (d < 0) return `Abgabe war vor ${-d} ${-d === 1 ? 'Tag' : 'Tagen'}`
  if (d === 0) return 'Abgabe heute'
  if (d === 1) return 'Abgabe morgen'
  if (d < 14) return `Abgabe in ${d} Tagen`
  return `Abgabe in ${Math.round(d / 7)} Wochen`
}
