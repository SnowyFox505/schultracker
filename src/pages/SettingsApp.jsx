import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import SubPage from '../components/SubPage'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { UpdatingOverlay } from '../components/UpdateFx'
import { refreshApp } from '../lib/refreshApp'

export default function SettingsApp() {
  const [refreshing, setRefreshing] = useState(false)

  function handleRefresh() {
    setRefreshing(true)
    refreshApp()
  }

  return (
    <>
      <SubPage title="App">
        <Card className="!p-4">
          <p className="mb-4 text-sm text-[var(--color-ink-dim)]">
            Holt die neueste Version: leert den Zwischenspeicher und lädt die App neu. Deine Daten bleiben erhalten.
          </p>
          <Button variant="secondary" onClick={handleRefresh} disabled={refreshing} className="w-full">
            {refreshing ? 'Lädt neu…' : 'App aktualisieren'}
          </Button>
        </Card>
      </SubPage>
      <AnimatePresence>{refreshing && <UpdatingOverlay />}</AnimatePresence>
    </>
  )
}
