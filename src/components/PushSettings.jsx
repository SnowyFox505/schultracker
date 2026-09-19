import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { disablePush, enablePush, pushSupported, sendTestPush } from '../lib/push'
import Button from './ui/Button'

const DAY_OPTIONS = [7, 5, 3, 2, 1]

export default function PushSettings() {
  const { user, profile, updateUserProfile } = useAuth()
  const [supported, setSupported] = useState(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    pushSupported().then(setSupported)
  }, [])

  const push = profile?.push || {}
  const enabled = !!push.enabled
  const homework = { on: true, time: '18:00', ...push.homework }
  const tests = { on: true, time: '18:00', days: [5, 1], ...push.tests }
  const skipSchool = push.skipSchool !== false

  const save = (patch) => updateUserProfile({ push: patch })

  async function turnOn() {
    setBusy(true)
    setMessage('')
    try {
      await enablePush(user)
      await save({ enabled: true })
    } catch (err) {
      setMessage(
        err.message === 'denied'
          ? 'Benachrichtigungen wurden abgelehnt. Du kannst sie in den Geräte-Einstellungen für diese App erlauben.'
          : 'Das hat nicht geklappt. Versuch es nochmal.'
      )
    }
    setBusy(false)
  }

  async function turnOff() {
    setBusy(true)
    await disablePush(user)
    await save({ enabled: false })
    setBusy(false)
  }

  async function test() {
    setBusy(true)
    setMessage('')
    try {
      const sent = await sendTestPush()
      setMessage(sent > 0 ? 'Test-Nachricht gesendet ✓' : 'Kein Gerät gefunden. Aktiviere die Benachrichtigungen erneut.')
    } catch {
      setMessage('Senden hat nicht geklappt (Server nicht eingerichtet?).')
    }
    setBusy(false)
  }

  if (supported === null) return null

  if (!supported) {
    return (
      <p className="text-sm text-[var(--color-ink-dim)]">
        Benachrichtigungen sind hier nicht verfügbar. Auf dem iPhone/iPad musst du die App zuerst über „Teilen → Zum Home-Bildschirm“ installieren und von dort öffnen.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {!enabled ? (
        <>
          <p className="text-sm text-[var(--color-ink-dim)]">
            Lass dich abends an offene Hausaufgaben und kommende Tests erinnern.
          </p>
          <Button onClick={turnOn} disabled={busy} className="w-full">
            🔔 Benachrichtigungen erlauben
          </Button>
        </>
      ) : (
        <>
          <Row label="Hausaufgaben für morgen" on={homework.on} onToggle={() => save({ homework: { on: !homework.on } })}>
            <TimeField value={homework.time} onChange={(time) => save({ homework: { time } })} />
          </Row>
          <Row label="Test-Countdown" on={tests.on} onToggle={() => save({ tests: { on: !tests.on } })}>
            <TimeField value={tests.time} onChange={(time) => save({ tests: { time } })} />
            <div className="mt-3 flex flex-wrap gap-2">
              {DAY_OPTIONS.map((d) => {
                const active = tests.days.includes(d)
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() =>
                      save({ tests: { days: active ? tests.days.filter((x) => x !== d) : [...tests.days, d].sort((a, b) => b - a) } })
                    }
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      active ? 'bg-[var(--color-accent)] text-black' : 'bg-[var(--color-surface-2)] text-[var(--color-ink-faint)]'
                    }`}
                  >
                    {d === 1 ? 'am Vorabend' : `${d} Tage vorher`}
                  </button>
                )
              })}
            </div>
          </Row>
          <Row
            label="Nur außerhalb der Schulzeit"
            hint="Fällt eine Nachricht in eine Unterrichtsstunde laut Stundenplan, kommt sie erst danach."
            on={skipSchool}
            onToggle={() => save({ skipSchool: !skipSchool })}
          />
          <div className="flex gap-3">
            <Button variant="secondary" onClick={test} disabled={busy} className="flex-1">
              Test-Nachricht
            </Button>
            <Button variant="secondary" onClick={turnOff} disabled={busy} className="flex-1">
              Ausschalten
            </Button>
          </div>
        </>
      )}
      {message && <p className="text-sm text-[var(--color-ink-dim)]">{message}</p>}
    </div>
  )
}

function Row({ label, hint, on, onToggle, children }) {
  return (
    <div className="rounded-2xl bg-[var(--color-surface-2)] p-4">
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-4 text-left">
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold">{label}</span>
          {hint && <span className="mt-0.5 block text-xs text-[var(--color-ink-faint)]">{hint}</span>}
        </span>
        <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-surface)]'}`}>
          <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? 'left-[1.375rem]' : 'left-0.5'}`} />
        </span>
      </button>
      {on && children && <div className="mt-3">{children}</div>}
    </div>
  )
}

function TimeField({ value, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm text-[var(--color-ink-dim)]">
      Uhrzeit
      <input
        type="time"
        value={value}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[16px] text-[var(--color-ink)] outline-none"
      />
    </label>
  )
}
