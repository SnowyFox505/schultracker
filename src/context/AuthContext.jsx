import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      if (!u) {
        setProfile(null)
        setLoading(false)
      }
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!user) return
    const ref = doc(db, 'users', user.uid)
    const unsub = onSnapshot(ref, (snap) => {
      setProfile(snap.exists() ? snap.data() : null)
      setLoading(false)
    })
    return unsub
  }, [user])

  async function signup(email, password) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await setDoc(doc(db, 'users', cred.user.uid), {
      name: '',
      email,
      onboardingComplete: false,
      subjects: [],
      colorTheme: 'sunset',
      createdAt: serverTimestamp(),
    })
  }

  async function login(email, password) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function logout() {
    await signOut(auth)
  }

  async function completeOnboarding(data) {
    if (!user) return
    if (data.name) {
      await updateProfile(user, { displayName: data.name })
    }
    await setDoc(
      doc(db, 'users', user.uid),
      { ...data, onboardingComplete: true },
      { merge: true }
    )
  }

  async function updateUserProfile(data) {
    if (!user) return
    await setDoc(doc(db, 'users', user.uid), data, { merge: true })
  }

  async function addCustomColor(color) {
    if (!user) return
    const existing = profile?.customColors || []
    if (existing.some((c) => c.id === color.id)) return
    await updateUserProfile({ customColors: [...existing, color] })
  }

  async function removeCustomColor(id) {
    if (!user) return
    const existing = profile?.customColors || []
    await updateUserProfile({ customColors: existing.filter((c) => c.id !== id) })
  }

  async function hidePresetColor(id) {
    if (!user) return
    const existing = profile?.hiddenColors || []
    if (existing.includes(id)) return
    await updateUserProfile({ hiddenColors: [...existing, id] })
  }

  const value = {
    user,
    profile,
    loading,
    signup,
    login,
    logout,
    completeOnboarding,
    updateUserProfile,
    addCustomColor,
    removeCustomColor,
    hidePresetColor,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
