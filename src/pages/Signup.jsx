import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import GoogleButton from '../components/GoogleButton'
import PageTransition from '../components/PageTransition'

export default function Signup() {
  const { signup, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen haben.')
      return
    }
    setBusy(true)
    try {
      await signup(email, password)
      navigate('/onboarding')
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Diese E-Mail wird schon verwendet.')
      } else {
        setError('Registrierung fehlgeschlagen. Versuch es nochmal.')
      }
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogle() {
    setError('')
    try {
      await loginWithGoogle()
      navigate('/')
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setError('Google-Anmeldung fehlgeschlagen.')
      }
    }
  }

  return (
    <div className="gradient-warm flex min-h-screen w-full items-center justify-center px-6">
      <PageTransition className="w-full max-w-sm">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-1 font-[var(--font-display)] text-5xl font-extrabold tracking-tight"
        >
          Los
          <br />
          geht's.
        </motion.h1>
        <p className="mb-8 text-[var(--color-ink-dim)]">Erstell deinen Account in ein paar Sekunden.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="E-Mail"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="du@schule.de"
          />
          <Input
            label="Passwort"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mind. 6 Zeichen"
          />
          {error && <p className="text-sm text-[#ff6b81]">{error}</p>}
          <Button type="submit" disabled={busy} className="mt-2 w-full">
            {busy ? 'Einen Moment…' : 'Account erstellen'}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--color-border)]" />
          <span className="text-xs text-[var(--color-ink-faint)]">oder</span>
          <div className="h-px flex-1 bg-[var(--color-border)]" />
        </div>

        <GoogleButton onClick={handleGoogle} />

        <p className="mt-6 text-center text-sm text-[var(--color-ink-dim)]">
          Schon einen Account?{' '}
          <Link to="/login" className="font-semibold text-[var(--color-accent)]">
            Anmelden
          </Link>
        </p>
      </PageTransition>
    </div>
  )
}
