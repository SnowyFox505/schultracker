import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import SubPage from '../components/SubPage'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { UpdatingOverlay } from '../components/UpdateFx'

export default function SettingsApp() {
  const [refreshing, setRefreshing] = useState(false)

  async function refreshApp() {
    setRefreshing(true)
    const minWait = new Promise((r) => setTimeout(r, 3000))
    try {
      const regs = await navigator.serviceWorker?.getRegistrations()
      await Promise.all((regs || []).map((r) => r.unregister()))
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
    } catch {
      // still reload below
    }
    await minWait
    try {
      sessionStorage.setItem('justUpdated', '1')
    } catch {
      // storage unavailable — the celebration just won't show
    }
    // land on the changelog so the user sees what's new
    window.location.replace('/einstellungen/neuigkeiten')
  }

  return (
    <>
      <SubPage title="App">
        <Card className="!p-4">
          <p className="mb-4 text-sm text-[var(--color-ink-dim)]">
            Holt die neueste Version: leert den Zwischenspeicher und lädt die App neu. Deine Daten bleiben erhalten.
          </p>
          <Button variant="secondary" onClick={refreshApp} disabled={refreshing} className="w-full">
            {refreshing ? 'Lädt neu…' : 'App aktualisieren'}
          </Button>
        </Card>
      </SubPage>
      <AnimatePresence>{refreshing && <UpdatingOverlay />}</AnimatePresence>
    </>
  )
}
