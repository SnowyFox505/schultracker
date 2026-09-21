import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { deleteAccountAndData } from '../lib/deleteAccount'
import SubPage from '../components/SubPage'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Sheet from '../components/Sheet'
import DeletingOverlay from '../components/DeletingOverlay'

export default function SettingsAccount() {
  const { user, requestLogout } = useAuth()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(e) {
    e.preventDefault()
    if (!password) return
    setDeleteError('')
    setDeleting(true)
    try {
      await deleteAccountAndData(user, password, {
        beforeAuthDelete: () => new Promise((resolve) => setTimeout(resolve, 4400)),
      })
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setDeleteError('Falsches Passwort.')
      } else {
        setDeleteError('Löschen fehlgeschlagen. Versuch es nochmal.')
      }
      setDeleting(false)
    }
  }

  return (
    <>
      <SubPage title="Account">
        <Card className="!p-4">
          <p className="mb-4 text-sm text-[var(--color-ink-dim)]">{user?.email}</p>
          <Button variant="secondary" onClick={requestLogout} className="w-full">
            Abmelden
          </Button>
        </Card>

        <div className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-[#ff6b81]">Gefahrenzone</h2>
        <Card className="!p-4 border-[#ff6b8140]">
          <p className="mb-4 text-sm text-[var(--color-ink-dim)]">
            Löscht deinen Account und alle Daten (Stundenplan, Hausaufgaben, Notizen, Tests) unwiderruflich.
          </p>
          <Button
            onClick={() => setDeleteOpen(true)}
            className="w-full !bg-none"
            style={{ background: '#ff6b81', color: '#0a0a0f' }}
          >
            Account löschen
          </Button>
        </Card>
        </div>

      <Sheet open={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)} title="Account wirklich löschen?">
        <p className="mb-5 text-sm text-[var(--color-ink-dim)]">
          Das kann nicht rückgängig gemacht werden. Gib dein Passwort ein, um endgültig zu löschen.
        </p>
        <form onSubmit={handleDelete} className="flex flex-col gap-4">
          <Input
            type="password"
            autoFocus
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Dein Passwort"
          />
          {deleteError && <p className="text-sm text-[#ff6b81]">{deleteError}</p>}
          <div className="flex gap-3">
            <Button variant="secondary" type="button" onClick={() => setDeleteOpen(false)} disabled={deleting} className="flex-1">
              Abbrechen
            </Button>
            <Button type="submit" disabled={deleting} className="flex-1" style={{ background: '#ff6b81', color: '#0a0a0f' }}>
              {deleting ? 'Löscht…' : 'Endgültig löschen'}
            </Button>
          </div>
        </form>
      </Sheet>
      </SubPage>
      <AnimatePresence>{deleting && <DeletingOverlay />}</AnimatePresence>
    </>
  )
}
