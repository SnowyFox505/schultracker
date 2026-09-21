import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  currentDeviceId,
  deviceLabel,
  disablePush,
  effectivePrefs,
  enablePush,
  pushSupported,
  sendTestPush,
  setDeviceEnabled,
  setDevicePrefs,
  useDevices,
} from '../lib/push'
import Button from './ui/Button'

const DAY_OPTIONS = [7, 5, 3, 2, 1]

// Notification settings are per device: each phone/tablet keeps its own on/off, times and days.
export default function PushSettings() {
  const { user, profile, updateUserProfile } = useAuth()
  const devices = useDevices(user)
  const [supported, setSupported] = useState(null)
  const [thisId, setThisId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    pushSupported().then(setSupported)
  }, [])

  // find out which device document belongs to this browser (needs granted permission)
  useEffect(() => {
    currentDeviceId().then(setThisId)
  }, [devices?.length])

  const thisDevice = devices?.find((d) => d.id === thisId) || null
  const enabled = !!thisDevice && (thisDevice.enabled ?? !!profile?.push?.enabled)
  const prefs = effectivePrefs(profile?.push, thisDevice?.prefs)
  const { homework, tests, skipSchool } = prefs
  const others = (devices || []).filter((d) => d.id !== thisId)
  const isOn = (d) => (d.enabled ?? !!profile?.push?.enabled) !== false

  const save = (patch) => setDevicePrefs(user, thisId, patch)

  // the server only looks at users with this flag: keep it true while at least one device is on
  const syncAccountFlag = (list) => updateUserProfile({ push: { enabled: list.some(isOn) } })

  async function turnOn() {
    setBusy(true)
    setMessage('')
    try {
      const id = await enablePush(user)
      setThisId(id)
      await updateUserProfile({ push: { enabled: true } })
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
    await syncAccountFlag(others)
    setBusy(false)
  }

  async function toggleOther(d) {
    const next = !isOn(d)
    await setDeviceEnabled(user, d.id, next)
    await syncAccountFlag([...(thisDevice ? [thisDevice] : []), ...others.map((o) => (o.id === d.id ? { ...o, enabled: next } : o))])
  }

  async function test() {
    setBusy(true)
    setMessage('')
    try {
      const sent = await sendTestPush(thisId)
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
            Lass dich abends an offene Hausaufgaben und kommende Tests erinnern. Das gilt nur für dieses Gerät ({deviceLabel()}), auf anderen stellst du es getrennt ein.
          </p>
          <Button onClick={turnOn} disabled={busy} className="w-full">
            🔔 Benachrichtigungen erlauben
          </Button>
        </>
      ) : (
        <>
          <p className="text-xs text-[var(--color-ink-faint)]">Diese Einstellungen gelten nur für dieses Gerät ({thisDevice?.label || deviceLabel()}).</p>
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
                    onClick={() => save({ tests: { days: active ? tests.days.filter((x) => x !== d) : [...tests.days, d].sort((a, b) => b - a) } })}
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
              Hier ausschalten
            </Button>
          </div>
        </>
      )}

      {others.length > 0 && (
        <div className="mt-2">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-faint)]">Deine anderen Geräte</h3>
          <div className="flex flex-col gap-2">
            {others.map((d) => (
              <Row
                key={d.id}
                label={d.label || 'Gerät'}
                hint={`${effectivePrefs(profile?.push, d.prefs).homework.time} Uhr. Zum Ändern die Einstellungen auf diesem Gerät öffnen.`}
                on={isOn(d)}
                onToggle={() => toggleOther(d)}
              />
            ))}
          </div>
        </div>
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
