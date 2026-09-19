import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import QRCode from 'qrcode'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { createBubble, joinBubble, leaveBubble, migrateHomework } from '../lib/bubble'
import { useCollection } from '../lib/useCollection'
import { useAuth } from '../context/AuthContext'
import PageTransition from '../components/PageTransition'
import Sheet from '../components/Sheet'
import QrScanner from '../components/QrScanner'
import BubbleOrb from '../components/BubbleOrb'
import BubbleShare from '../components/BubbleShare'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Bubble() {
  const { user, profile } = useAuth()
  const [searchParams] = useSearchParams()
  const bubbleId = profile?.bubbleId || null
  const [bubble, setBubble] = useState(null)
  const [joinCode, setJoinCode] = useState(() => (searchParams.get('code') || '').toUpperCase().slice(0, 6))
  const [qr, setQr] = useState('')
  const [scanning, setScanning] = useState(false)
  const [askMigrate, setAskMigrate] = useState(false)
  const { items: personalHomework } = useCollection('homework', { order: 'dueDate', direction: 'asc' })
  const openOld = personalHomework.filter((h) => !h.done)
  const [bubbleError, setBubbleError] = useState('')
  const [bubbleBusy, setBubbleBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!bubbleId) return
    return onSnapshot(
      doc(db, 'bubbles', bubbleId),
      (snap) => setBubble(snap.exists() ? snap.data() : null),
      () => setBubble(null)
    )
  }, [bubbleId])

  useEffect(() => {
    if (!bubbleId) return
    const link = `${window.location.origin}/bubble?code=${bubbleId}`
    QRCode.toDataURL(link, { margin: 1, width: 240, color: { dark: '#0a0a0f', light: '#ffffff' } }).then(setQr)
  }, [bubbleId])

  async function migrate() {
    setBubbleBusy(true)
    try {
      await migrateHomework(user, profile?.name || '', bubbleId, openOld)
    } catch {
      setBubbleError('Übernehmen hat nicht geklappt. Versuch es nochmal.')
    }
    setBubbleBusy(false)
    setAskMigrate(false)
  }

  async function runBubble(action, offerMigration = false) {
    setBubbleError('')
    setBubbleBusy(true)
    try {
      await action()
      setJoinCode('')
      if (offerMigration) setAskMigrate(true)
    } catch (err) {
      setBubbleError(
        err.message === 'not-found'
          ? 'Diesen Code gibt es nicht.'
          : err.message === 'full'
            ? 'Diese Bubble ist schon voll (max. 3).'
            : 'Das hat nicht geklappt. Versuch es nochmal.'
      )
    }
    setBubbleBusy(false)
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(bubbleId)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard unavailable — the code is displayed anyway
    }
  }

  return (
    <PageTransition>
      <h1 className="mb-6 font-[var(--font-display)] text-3xl font-extrabold md:text-4xl">Bubble</h1>

      {bubbleId && bubble?.memberNames && <BubbleOrb names={Object.values(bubble.memberNames)} />}

      <section>
        <Card className="!p-4">
          {bubbleId ? (
            <>
              <p className="mb-3 text-sm text-[var(--color-ink-dim)]">
                Neue Hausaufgaben, die du einträgst, sehen alle in deiner Bubble.
              </p>
              <button
                type="button"
                onClick={copyCode}
                className="mb-3 flex w-full items-center justify-between rounded-2xl bg-[var(--color-surface-2)] px-4 py-3.5 active:opacity-80"
              >
                <span className="font-[var(--font-display)] text-2xl font-extrabold tracking-[0.25em]">{bubbleId}</span>
                <span className="text-sm font-medium text-[var(--color-accent)]">{copied ? 'Kopiert ✓' : 'Kopieren'}</span>
              </button>
              {openOld.length > 0 && (
                <Button variant="secondary" onClick={() => setAskMigrate(true)} className="mb-3 w-full">
                  Meine alten Hausaufgaben übernehmen ({openOld.length})
                </Button>
              )}
              {qr && (
                <div className="mb-4 flex flex-col items-center">
                  <img src={qr} alt="QR-Code zum Beitreten" className="h-44 w-44 rounded-2xl" />
                  <p className="mt-2 text-xs text-[var(--color-ink-faint)]">Freund scannt das mit der Kamera und tritt bei</p>
                </div>
              )}
              <Button variant="secondary" disabled={bubbleBusy} onClick={() => runBubble(() => leaveBubble(user))} className="w-full">
                Bubble verlassen
              </Button>
            </>
          ) : (
            <>
              <p className="mb-4 text-sm text-[var(--color-ink-dim)]">
                Teile Hausaufgaben mit bis zu 2 Freunden — nur einer muss sie eintragen.
              </p>
              <Button disabled={bubbleBusy} onClick={() => runBubble(() => createBubble(user, profile?.name || ''), true)} className="mb-4 w-full">
                Bubble erstellen
              </Button>
              <Button variant="secondary" onClick={() => setScanning(true)} className="mb-4 w-full">
                📷 QR-Code scannen
              </Button>
              <div className="flex gap-2">
                <Input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Code eingeben"
                  maxLength={6}
                  className="flex-1 tracking-widest"
                />
                <Button
                  variant="secondary"
                  disabled={bubbleBusy || joinCode.length < 6}
                  onClick={() => runBubble(() => joinBubble(user, profile?.name || '', joinCode), true)}
                  className="px-4"
                >
                  Beitreten
                </Button>
              </div>
            </>
          )}
          {bubbleError && <p className="mt-3 text-sm text-[#ff6b81]">{bubbleError}</p>}
        </Card>
      </section>

      {bubbleId && <BubbleShare bubbleId={bubbleId} />}

      <Sheet open={askMigrate && !!bubbleId && openOld.length > 0} onClose={() => setAskMigrate(false)} title="Alte Hausaufgaben mitnehmen?">
        <p className="mb-5 text-sm text-[var(--color-ink-dim)]">
          Du hast noch {openOld.length} offene Hausaufgabe{openOld.length === 1 ? '' : 'n'}, die nur du siehst. Sollen sie in deine Bubble, damit alle sie sehen?
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" type="button" onClick={() => setAskMigrate(false)} className="flex-1">
            Erstmal nicht
          </Button>
          <Button type="button" disabled={bubbleBusy} onClick={migrate} className="flex-1">
            Ja, gerne!
          </Button>
        </div>
      </Sheet>

      <Sheet open={scanning} onClose={() => setScanning(false)} title="QR-Code scannen">
        {scanning && (
          <QrScanner
            onCode={(code) => {
              setScanning(false)
              runBubble(() => joinBubble(user, profile?.name || '', code), true)
            }}
          />
        )}
        <p className="mt-3 text-center text-xs text-[var(--color-ink-faint)]">Halte die Kamera auf den QR-Code deines Freundes.</p>
      </Sheet>
    </PageTransition>
  )
}
