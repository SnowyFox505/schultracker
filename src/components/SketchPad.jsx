import { useEffect, useRef, useState } from 'react'

const MIN_DIST_SQ = 0.000004 // tiny — only drops exact duplicates; fast writing needs every point
const MAX_UNDO = 6

export default function SketchPad({ value = [], onChange, height = 180 }) {
  const canvasRef = useRef(null)
  // Tracked per-pointerId so two simultaneous contacts (e.g. a mouse plus a pen, in theory)
  // never clobber a single shared "current stroke".
  const activeStrokesRef = useRef(new Map())
  const [strokes, setStrokes] = useState(value)
  // Always-current copy so a fast stroke that ends before React re-rendered never commits onto a stale list.
  const strokesRef = useRef(value)
  const [undosLeft, setUndosLeft] = useState(MAX_UNDO)
  // This is a controlled component: every onChange we fire flows right back down as a new
  // `value` prop. Without this, that echo would look identical to "a different item was
  // opened" and reset the undo budget back to MAX_UNDO after every single stroke/undo.
  const lastEmittedRef = useRef(value)

  useEffect(() => {
    if (value === lastEmittedRef.current) return
    lastEmittedRef.current = value
    strokesRef.current = value
    setStrokes(value)
    setUndosLeft(MAX_UNDO)
  }, [value])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new ResizeObserver(() => draw(strokes))
    observer.observe(canvas)
    draw(strokes)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strokes])

  function size() {
    const canvas = canvasRef.current
    return { w: canvas.clientWidth, h: canvas.clientHeight }
  }

  function draw(strokeList) {
    const canvas = canvasRef.current
    if (!canvas) return
    const { w, h } = size()
    const dpr = window.devicePixelRatio || 1
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr
      canvas.height = h * dpr
    }
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    strokeList.forEach((stroke) => {
      if (stroke.length < 2) return
      ctx.beginPath()
      stroke.forEach((pt, i) => {
        const x = pt.x * w
        const y = pt.y * h
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()
    })
  }

  function pointFromEvent(e) {
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    }
  }

  function redrawWithActive() {
    draw([...strokesRef.current, ...activeStrokesRef.current.values()])
  }

  function handlePointerDown(e) {
    // Pencil-only: with a finger allowed to draw too, a resting palm competing with the
    // Apple Pencil made strokes feel completely unreliable. Simplest fix that's actually
    // reliable: while in this mode, only 'pen' (Apple Pencil) and 'mouse' (desktop) draw —
    // touch is ignored outright rather than trying to guess "was that a palm or a finger".
    if (e.pointerType === 'touch') return

    e.preventDefault()
    try {
      canvasRef.current.setPointerCapture(e.pointerId)
    } catch {
      // ignore — a capture failure shouldn't stop the stroke from being tracked
    }
    activeStrokesRef.current.set(e.pointerId, [pointFromEvent(e)])
  }

  function addPoint(stroke, pt) {
    const last = stroke[stroke.length - 1]
    if (last) {
      const dx = pt.x - last.x
      const dy = pt.y - last.y
      if (dx * dx + dy * dy < MIN_DIST_SQ) return
    }
    stroke.push(pt)
  }

  function handlePointerMove(e) {
    const stroke = activeStrokesRef.current.get(e.pointerId)
    if (!stroke) return
    e.preventDefault()
    // Fast pen movement is delivered as several coalesced samples per event — use them all.
    const events = e.getCoalescedEvents?.() || []
    for (const ev of events.length ? events : [e]) addPoint(stroke, pointFromEvent(ev))
    redrawWithActive()
  }

  function handlePointerUp(e) {
    const stroke = activeStrokesRef.current.get(e.pointerId)
    activeStrokesRef.current.delete(e.pointerId)
    if (!stroke) return
    if (e.type === 'pointerup') addPoint(stroke, pointFromEvent(e))
    if (stroke.length === 1) stroke.push({ ...stroke[0] }) // a tap becomes a dot
    const finished = stroke.map((p) => ({
      x: Math.round(p.x * 1000) / 1000,
      y: Math.round(p.y * 1000) / 1000,
    }))
    if (finished.length > 1) {
      const next = [...strokesRef.current, finished]
      strokesRef.current = next
      lastEmittedRef.current = next
      setStrokes(next)
      onChange?.(next)
    } else {
      redrawWithActive()
    }
  }

  function undo() {
    if (undosLeft <= 0 || strokes.length === 0) return
    const next = strokesRef.current.slice(0, -1)
    strokesRef.current = next
    lastEmittedRef.current = next
    setUndosLeft((n) => n - 1)
    setStrokes(next)
    onChange?.(next)
  }

  function clear() {
    lastEmittedRef.current = []
    strokesRef.current = []
    setStrokes([])
    onChange?.([])
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{ height }}
        className="touch-none w-full rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-2)]"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-[var(--color-ink-faint)]">Nur mit dem Stift zeichnen</span>
        <div className="flex items-center gap-4">
          {strokes.length > 0 && undosLeft > 0 && (
            <button type="button" onClick={undo} className="text-sm font-medium text-[var(--color-ink-faint)] active:opacity-70">
              Zurück
            </button>
          )}
          {strokes.length > 0 && (
            <button type="button" onClick={clear} className="text-sm font-medium text-[var(--color-ink-faint)] active:opacity-70">
              Löschen
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Firestore rejects arrays nested directly inside arrays, so strokes (array of point-arrays)
// are stored as an array of { points } objects and converted back at the edges.
export function strokesToFirestore(strokes) {
  return strokes.map((points) => ({ points }))
}

export function strokesFromFirestore(sketch) {
  return (sketch || []).map((s) => s.points)
}

export function SketchThumbnail({ strokes, className = '' }) {
  if (!strokes || strokes.length === 0) return null
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className={className}>
      {strokes.map((stroke, i) => (
        <polyline
          key={i}
          points={stroke.map((p) => `${p.x * 100},${p.y * 40}`).join(' ')}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}
