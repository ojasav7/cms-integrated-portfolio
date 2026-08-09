import { useRef } from 'react'
import { useSmoothCursor } from './use-smooth-cursor'

/**
 * Layer 1 — a faint SVG grid (48×48px cells, L-shaped corner strokes).
 * The pattern drifts extremely subtly with the cursor: offset relative to the
 * viewport centre, multiplied by 16, eased with a ~0.06 lerp.
 */
export function MeasuredGrid() {
  const patternRef = useRef<SVGPatternElement>(null)
  // Last-written translation — skips redundant attribute writes once converged.
  const last = useRef({ x: Number.NaN, y: Number.NaN })

  useSmoothCursor(0.06, (x, y) => {
    const dx = (x - window.innerWidth / 2) * 16
    const dy = (y - window.innerHeight / 2) * 16
    if (dx === last.current.x && dy === last.current.y) return
    last.current = { x: dx, y: dy }
    patternRef.current?.setAttribute('patternTransform', `translate(${dx} ${dy})`)
  })

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      style={{ opacity: 0.1 }}
    >
      <defs>
        <pattern
          ref={patternRef}
          data-grid-pattern
          id="measured-grid"
          width="48"
          height="48"
          patternUnits="userSpaceOnUse"
        >
          <path d="M 48 0 L 0 0 L 0 48" fill="none" stroke="#64748b" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#measured-grid)" />
    </svg>
  )
}
