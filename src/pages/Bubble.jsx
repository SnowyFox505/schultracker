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
import BubbleFx from '../components/BubbleFx'
import { AnimatePresence } from 'framer-motion'
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
  const [showQr, setShowQr] = useState(false)
  const [askMigrate, setAskMigrate] = useState(false)
  const [fx, setFx] = useState(null)
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

  async function runBubble(action, fxMode = null) {
    setBubbleError('')
    setBubbleBusy(true)
    try {
      const result = await action()
      setJoinCode('')
      if (fxMode) setFx({ mode: fxMode, code: result })
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
    <>
      <AnimatePresence>
        {fx && (
          <BubbleFx
            mode={fx.mode}
            code={fx.code}
            name={profile?.name || ''}
            names={Object.values(bubble?.memberNames || {})}
            onDone={() => {
              if (fx.mode !== 'leave') setAskMigrate(true)
              setFx(null)
            }}
          />
        )}
      </AnimatePresence>
    <PageTransition>
      <h1 className="mb-6 font-[var(--font-display)] text-3xl font-extrabold md:text-4xl">Bubble</h1>

      {bubbleId && bubble?.memberNames && <BubbleOrb names={Object.values(bubble.memberNames)} />}

      {bubbleId ? (
        <section>
          <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-faint)]">Dein Bubble-Code</p>
            <p className="my-2 font-[var(--font-display)] text-4xl font-extrabold tracking-[0.3em] text-[var(--color-accent)]">{bubbleId}</p>
            <p className="mb-4 text-sm text-[var(--color-ink-dim)]">Neue Hausaufgaben, die du einträgst, sehen alle in deiner Bubble.</p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={copyCode} className="flex-1">
                {copied ? 'Kopiert ✓' : 'Kopieren'}
              </Button>
              <Button variant="secondary" onClick={() => setShowQr(true)} className="flex-1">
                QR-Code
              </Button>
            </div>
          </div>

          {openOld.length > 0 && (
            <button
              type="button"
              onClick={() => setAskMigrate(true)}
              className="mt-3 flex w-full items-center gap-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 text-left transition-transform active:scale-[0.985]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-lg">📚</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold">Alte Hausaufgaben übernehmen</span>
                <span className="block text-xs text-[var(--color-ink-faint)]">{openOld.length} offen, nur für dich sichtbar</span>
              </span>
              <span className="text-[var(--color-ink-faint)]">›</span>
            </button>
          )}
        </section>
      ) : (
        <section>
          <Card className="!p-4">
            <p className="mb-4 text-sm text-[var(--color-ink-dim)]">
              Teile Hausaufgaben mit bis zu 2 Freunden — nur einer muss sie eintragen.
            </p>
            <Button disabled={bubbleBusy} onClick={() => runBubble(() => createBubble(user, profile?.name || ''), 'create')} className="mb-4 w-full">
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
                onClick={() => runBubble(() => joinBubble(user, profile?.name || '', joinCode), 'join')}
                className="px-4"
              >
                Beitreten
              </Button>
            </div>
            {bubbleError && <p className="mt-3 text-sm text-[#ff6b81]">{bubbleError}</p>}
          </Card>
        </section>
      )}

      {bubbleId && <BubbleShare bubbleId={bubbleId} />}

      {bubbleId && (
        <div className="mt-10 text-center">
          <button
            type="button"
            disabled={bubbleBusy}
            onClick={() => runBubble(() => leaveBubble(user), 'leave')}
            className="text-sm font-medium text-[var(--color-ink-faint)] transition-colors active:text-[#ff6b81] disabled:opacity-50"
          >
            Bubble verlassen
          </button>
          {bubbleError && <p className="mt-2 text-sm text-[#ff6b81]">{bubbleError}</p>}
        </div>
      )}

      <Sheet open={showQr} onClose={() => setShowQr(false)} title="Zum Beitreten scannen">
        <div className="flex flex-col items-center pb-2">
          {qr && <img src={qr} alt="QR-Code zum Beitreten" className="h-56 w-56 rounded-2xl" />}
          <p className="mt-3 text-center text-xs text-[var(--color-ink-faint)]">Dein Freund scannt das mit der Kamera und tritt bei.</p>
        </div>
      </Sheet>

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
              runBubble(() => joinBubble(user, profile?.name || '', code), 'join')
            }}
          />
        )}
        <p className="mt-3 text-center text-xs text-[var(--color-ink-faint)]">Halte die Kamera auf den QR-Code deines Freundes.</p>
      </Sheet>
    </PageTransition>
    </>
  )
}
