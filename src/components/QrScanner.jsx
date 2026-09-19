import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'

function extractCode(text) {
  try {
    const fromUrl = new URL(text).searchParams.get('code')
    if (fromUrl) return fromUrl.toUpperCase()
  } catch {
    // not a URL — fall through and treat the raw text as a code
  }
  const raw = text.toUpperCase().replace(/[^A-Z0-9]/g, '')
  return raw.length === 6 ? raw : null
}

export default function QrScanner({ onCode }) {
  const videoRef = useRef(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let stream
    let frame
    let stopped = false
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    function tick() {
      const video = videoRef.current
      if (stopped || !video) return
      if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const result = jsQR(img.data, img.width, img.height)
        const code = result && extractCode(result.data)
        if (code) {
          stopped = true
          onCode(code)
          return
        }
      }
      frame = requestAnimationFrame(tick)
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((s) => {
        if (stopped) {
          s.getTracks().forEach((t) => t.stop())
          return
        }
        stream = s
        videoRef.current.srcObject = s
        return videoRef.current.play().then(tick)
      })
      .catch(() => setError('Kein Kamerazugriff. Erlaube die Kamera in den Einstellungen deines Geräts.'))

    return () => {
      stopped = true
      cancelAnimationFrame(frame)
      stream?.getTracks().forEach((t) => t.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error) return <p className="py-6 text-center text-sm text-[#ff6b81]">{error}</p>

  return (
    <div className="relative overflow-hidden rounded-3xl bg-black">
      <video ref={videoRef} playsInline muted className="aspect-square w-full object-cover" />
      <div className="pointer-events-none absolute inset-8 rounded-3xl border-2 border-white/80" />
    </div>
  )
}
