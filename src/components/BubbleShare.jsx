import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { importSchedule, migrateTests, shareSchedule, unshareSchedule } from '../lib/bubble'
import { useBubbleSchedules } from '../lib/useBubbleSchedules'
import { useCollection } from '../lib/useCollection'
import { useTests } from '../lib/useTests'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useSchedule } from '../lib/useSchedule'
import { useBreaks } from '../lib/useBreaks'
import Sheet from './Sheet'
import Card from './ui/Card'
import Button from './ui/Button'

export default function BubbleShare({ bubbleId }) {
  const { user, profile, updateUserProfile } = useAuth()
  const { lessons } = useSchedule()
  const { breaks } = useBreaks()
  const schedules = useBubbleSchedules(bubbleId)
  const { items: personalTests } = useCollection('tests', { order: 'date', direction: 'asc' })
  const { items: visibleTests } = useTests()
  const sharedVisible = visibleTests.filter((t) => t.shared)
  const [askKeep, setAskKeep] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [askTests, setAskTests] = useState(false)
  const [importTarget, setImportTarget] = useState(null)

  const mySchedule = schedules.find((x) => x.uid === user?.uid)
  const otherSchedules = schedules.filter((x) => x.uid !== user?.uid)
  const shareTests = !!profile?.shareTests
  const todayIso = new Date().toISOString().slice(0, 10)
  const upcomingOld = personalTests.filter((t) => t.date >= todayIso)

  async function run(action) {
    setError('')
    setBusy(true)
    try {
      await action()
    } catch {
      setError('Das hat nicht geklappt. Versuch es nochmal.')
    }
    setBusy(false)
  }

  async function turnOffTests(keep) {
    setBusy(true)
    try {
      if (keep) {
        const target = collection(db, 'users', user.uid, 'tests')
        for (const { subject, topic, date, photos } of sharedVisible) {
          await addDoc(target, { subject: subject ?? '', topic: topic ?? '', date, photos: photos ?? [], createdAt: serverTimestamp() })
        }
      }
      await updateUserProfile({ shareTests: false })
    } catch {
      setError('Das hat nicht geklappt. Versuch es nochmal.')
    }
    setBusy(false)
    setAskKeep(false)
  }

  async function toggleTests() {
    if (shareTests) {
      if (sharedVisible.length > 0) setAskKeep(true)
      else await updateUserProfile({ shareTests: false })
      return
    }
    const next = !shareTests
    await updateUserProfile({ shareTests: next })
    if (next && upcomingOld.length > 0) setAskTests(true)
  }

  function pushSchedule() {
    return shareSchedule(user, profile?.name || '', bubbleId, {
      lessons,
      breaks,
      subjects: profile?.subjects || [],
      customColors: profile?.customColors || [],
    })
  }

  async function doImport() {
    const target = importTarget
    setImportTarget(null)
    await run(() => importSchedule(user, target, profile, updateUserProfile))
  }

  async function doMigrateTests() {
    await run(() => migrateTests(user, profile?.name || '', bubbleId, upcomingOld))
    setAskTests(false)
  }

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-bold">Teilen</h2>
      <Card className="!p-4">
        <ToggleRow
          label="Tests & Termine teilen"
          hint="Neue Tests teilst du mit der Bubble. Jeder stellt das für sich ein: Nur wer es angeschaltet hat, sieht die geteilten Tests."
          on={shareTests}
          onClick={toggleTests}
        />
        <div className="my-4 border-t border-[var(--color-border)]" />
        <ToggleRow
          label="Meinen Stundenplan teilen"
          hint="Die anderen können ihn importieren. Es ist eine Kopie von jetzt."
          on={!!mySchedule}
          disabled={busy}
          onClick={() => run(() => (mySchedule ? unshareSchedule(user, bubbleId) : pushSchedule()))}
        />
        {mySchedule && (
          <Button variant="secondary" disabled={busy} onClick={() => run(pushSchedule)} className="mt-3 w-full">
            Geteilten Stundenplan aktualisieren
          </Button>
        )}
        {otherSchedules.map((sc) => (
          <div key={sc.uid} className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-[var(--color-surface-2)] px-4 py-3">
            <span className="min-w-0 truncate text-[15px] font-medium">Stundenplan von {sc.ownerName}</span>
            <Button variant="secondary" onClick={() => setImportTarget(sc)} className="shrink-0 px-4">
              Importieren
            </Button>
          </div>
        ))}
        {error && <p className="mt-3 text-sm text-[#ff6b81]">{error}</p>}
      </Card>

      <Sheet open={!!importTarget} onClose={() => setImportTarget(null)} title="Stundenplan importieren?">
        <p className="mb-5 text-sm text-[var(--color-ink-dim)]">
          Dein aktueller Stundenplan (inkl. Pausen) wird durch den von {importTarget?.ownerName} ersetzt. Fehlende Fächer werden angelegt.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" type="button" onClick={() => setImportTarget(null)} className="flex-1">
            Abbrechen
          </Button>
          <Button type="button" onClick={doImport} className="flex-1">
            Ja, importieren
          </Button>
        </div>
      </Sheet>

      <Sheet open={askKeep} onClose={() => setAskKeep(false)} title="Tests behalten?">
        <p className="mb-5 text-sm text-[var(--color-ink-dim)]">
          Du siehst gerade {sharedVisible.length} geteilte{sharedVisible.length === 1 ? 'n Test' : ' Tests'}. Wenn du das Teilen ausschaltest, sind sie bei dir sonst nicht mehr sichtbar. Sollen sie als private Kopien bei dir bleiben?
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" type="button" disabled={busy} onClick={() => turnOffTests(false)} className="flex-1">
            Nein, ausblenden
          </Button>
          <Button type="button" disabled={busy} onClick={() => turnOffTests(true)} className="flex-1">
            Ja, behalten
          </Button>
        </div>
      </Sheet>

      <Sheet open={askTests && upcomingOld.length > 0} onClose={() => setAskTests(false)} title="Alte Tests mitnehmen?">
        <p className="mb-5 text-sm text-[var(--color-ink-dim)]">
          Du hast noch {upcomingOld.length} anstehende{upcomingOld.length === 1 ? 'n Test' : ' Tests'}, die nur du siehst. Sollen sie in deine Bubble?
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" type="button" onClick={() => setAskTests(false)} className="flex-1">
            Erstmal nicht
          </Button>
          <Button type="button" disabled={busy} onClick={doMigrateTests} className="flex-1">
            Ja, gerne!
          </Button>
        </div>
      </Sheet>
    </section>
  )
}

function ToggleRow({ label, hint, on, onClick, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="flex w-full items-center gap-4 text-left disabled:opacity-60">
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold">{label}</span>
        <span className="mt-0.5 block text-xs text-[var(--color-ink-faint)]">{hint}</span>
      </span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-surface-2)]'}`}>
        <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? 'left-[1.375rem]' : 'left-0.5'}`} />
      </span>
    </button>
  )
}
