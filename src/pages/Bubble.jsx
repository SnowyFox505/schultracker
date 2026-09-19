import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { createBubble, joinBubble, leaveBubble } from '../lib/bubble'
import { useAuth } from '../context/AuthContext'
import PageTransition from '../components/PageTransition'
import BubbleOrb from '../components/BubbleOrb'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Bubble() {
  const { user, profile } = useAuth()
  const bubbleId = profile?.bubbleId || null
  const [bubble, setBubble] = useState(null)
  const [joinCode, setJoinCode] = useState('')
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

  async function runBubble(action) {
    setBubbleError('')
    setBubbleBusy(true)
    try {
      await action()
      setJoinCode('')
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
              <Button variant="secondary" disabled={bubbleBusy} onClick={() => runBubble(() => leaveBubble(user))} className="w-full">
                Bubble verlassen
              </Button>
            </>
          ) : (
            <>
              <p className="mb-4 text-sm text-[var(--color-ink-dim)]">
                Teile Hausaufgaben mit bis zu 2 Freunden — nur einer muss sie eintragen.
              </p>
              <Button disabled={bubbleBusy} onClick={() => runBubble(() => createBubble(user, profile?.name || ''))} className="mb-4 w-full">
                Bubble erstellen
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
                  onClick={() => runBubble(() => joinBubble(user, profile?.name || '', joinCode))}
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

    </PageTransition>
  )
}
