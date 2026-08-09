import { useEffect, useRef } from 'react'
import { useInView } from 'framer-motion'
import { FRONT_VIDEO } from './measured-assets'
import { useSmoothCursor } from './use-smooth-cursor'

const SPOTLIGHT_RADIUS = 260
const SIZE = SPOTLIGHT_RADIUS * 2 + 40
const CENTER = SIZE / 2

/**
 * Layer 5 — the cursor spotlight video reveal.
 *
 * The looping front video only becomes visible inside a soft 260px-radius
 * spotlight that trails the cursor. A hidden canvas draws the radial gradient
 * once and is exported as a data URL, which becomes the `mask-image` of the
 * video container. Each animation frame the mask is moved to the smoothed
 * cursor position — the video is clipped to the bottom 60% of the viewport,
 * so the top 40% never reveals it.
 */
export function MeasuredSpotlight() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const maskRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  // Last-written mask origin — skips redundant writes once the lerp converges.
  const lastPos = useRef({ x: Number.NaN, y: Number.NaN })

  // Play only while the spotlight is on screen (saves bandwidth below the fold).
  const maskInView = useInView(maskRef, { amount: 0.1, once: false })

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (maskInView) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [maskInView])

  useSmoothCursor(0.1, (x, y) => {
    if (x === lastPos.current.x && y === lastPos.current.y) return
    lastPos.current = { x, y }
    const mask = maskRef.current
    if (!mask) return
    const px = `${x - CENTER}px`
    const py = `${y - CENTER}px`
    mask.style.setProperty('-webkit-mask-position', `${px} ${py}`)
    mask.style.setProperty('mask-position', `${px} ${py}`)
  })

  useEffect(() => {
    const canvas = canvasRef.current
    const mask = maskRef.current
    if (!canvas || !mask) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Soft feather: centre → 100%, 40% → 100%, 60% → 75%, 75% → 40%,
    // 88% → 12%, 100% → 0% opacity.
    const gradient = ctx.createRadialGradient(CENTER, CENTER, 0, CENTER, CENTER, SPOTLIGHT_RADIUS)
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.4, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.6, 'rgba(255,255,255,0.75)')
    gradient.addColorStop(0.75, 'rgba(255,255,255,0.4)')
    gradient.addColorStop(0.88, 'rgba(255,255,255,0.12)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, SIZE, SIZE)

    // The gradient image itself never changes — only its position follows the
    // cursor — so the data URL is exported once and moved per frame.
    const dataUrl = `url(${canvas.toDataURL()})`
    const set = (prop: string, value: string) => mask.style.setProperty(prop, value)
    set('-webkit-mask-image', dataUrl)
    set('mask-image', dataUrl)
    set('-webkit-mask-size', `${SIZE}px ${SIZE}px`)
    set('mask-size', `${SIZE}px ${SIZE}px`)
    set('-webkit-mask-repeat', 'no-repeat')
    set('mask-repeat', 'no-repeat')
    // Park the spotlight off-screen until the cursor first moves.
    set('-webkit-mask-position', '-1200px -1200px')
    set('mask-position', '-1200px -1200px')
  }, [])

  return (
    <>
      <div
        ref={maskRef}
        data-spotlight-mask
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30"
      >
        <video
          ref={videoRef}
          src={FRONT_VIDEO}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ clipPath: 'inset(40% 0 0 0)' }}
        />
      </div>
      <canvas ref={canvasRef} width={SIZE} height={SIZE} className="hidden" aria-hidden="true" />
    </>
  )
}
