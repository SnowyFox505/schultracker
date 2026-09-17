import { useEffect, useRef, useState } from 'react'

const MIN_DIST_SQ = 0.0000625 // ~0.008 in normalized 0..1 units — thins points while dragging
const PEN_COOLDOWN_MS = 350 // ignore touch (palm) shortly after the pen lifts, in case it's still resting

export default function SketchPad({ value = [], onChange, height = 180 }) {
  const canvasRef = useRef(null)
  // Tracked per-pointerId so a palm (touch) and the Apple Pencil (pen) touching at the
  // same time don't clobber a single shared "current stroke" — that was the root cause
  // of drawing feeling random/unreliable with the pencil (see CLAUDE.md for the writeup).
  const activeStrokesRef = useRef(new Map())
  const pointerTypesRef = useRef(new Map())
  const penDownRef = useRef(false)
  const penUpAtRef = useRef(0)
  const [strokes, setStrokes] = useState(value)

  useEffect(() => {
    setStrokes(value)
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
    draw([...strokes, ...activeStrokesRef.current.values()])
  }

  function handlePointerDown(e) {
    const isPalmTouch =
      e.pointerType === 'touch' && (penDownRef.current || Date.now() - penUpAtRef.current < PEN_COOLDOWN_MS)
    if (isPalmTouch) return

    if (e.pointerType === 'pen') {
      penDownRef.current = true
      // A palm touch may have landed a few ms before the pencil tip — discard any
      // in-progress touch strokes now that we know the pencil is the real input.
      for (const [id, type] of pointerTypesRef.current) {
        if (type === 'touch') activeStrokesRef.current.delete(id)
      }
    }

    e.preventDefault()
    try {
      canvasRef.current.setPointerCapture(e.pointerId)
    } catch {
      // ignore — a capture failure shouldn't stop the stroke from being tracked
    }
    pointerTypesRef.current.set(e.pointerId, e.pointerType)
    activeStrokesRef.current.set(e.pointerId, [pointFromEvent(e)])
  }

  function handlePointerMove(e) {
    const stroke = activeStrokesRef.current.get(e.pointerId)
    if (!stroke) return
    e.preventDefault()
    const pt = pointFromEvent(e)
    const last = stroke[stroke.length - 1]
    if (last) {
      const dx = pt.x - last.x
      const dy = pt.y - last.y
      if (dx * dx + dy * dy < MIN_DIST_SQ) return
    }
    stroke.push(pt)
    redrawWithActive()
  }

  function handlePointerUp(e) {
    const stroke = activeStrokesRef.current.get(e.pointerId)
    activeStrokesRef.current.delete(e.pointerId)
    pointerTypesRef.current.delete(e.pointerId)
    if (e.pointerType === 'pen') {
      penDownRef.current = false
      penUpAtRef.current = Date.now()
    }
    if (!stroke) return
    const finished = stroke.map((p) => ({
      x: Math.round(p.x * 1000) / 1000,
      y: Math.round(p.y * 1000) / 1000,
    }))
    if (finished.length > 1) {
      const next = [...strokes, finished]
      setStrokes(next)
      onChange?.(next)
    } else {
      redrawWithActive()
    }
  }

  function clear() {
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
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-[var(--color-ink-faint)]">Mit Finger oder Stift zeichnen</span>
        {strokes.length > 0 && (
          <button type="button" onClick={clear} className="text-sm font-medium text-[var(--color-ink-faint)] active:opacity-70">
            Löschen
          </button>
        )}
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
