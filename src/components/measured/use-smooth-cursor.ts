import { useEffect, useRef } from 'react'

/**
 * Tracks the pointer and calls `onTick(x, y)` once per animation frame with a
 * smoothed (lerped) cursor position. All state lives in refs, so high-frequency
 * pointer movement never triggers React re-renders.
 *
 * - `lerpFactor` — per-frame easing (e.g. 0.1 for a soft cinematic lag).
 * - On the first pointer move the position snaps to the cursor so the effect
 *   doesn't glide in from off-screen.
 * - Under `prefers-reduced-motion` the position snaps every frame instead.
 * - `pointerdown` is also tracked so touch taps place the spotlight too.
 */
export function useSmoothCursor(lerpFactor: number, onTick: (x: number, y: number) => void) {
  const onTickRef = useRef(onTick)
  onTickRef.current = onTick

  useEffect(() => {
    const target = { x: 0, y: 0 }
    const smooth = { x: 0, y: 0 }
    let moved = false
    let raf = 0

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const strength = reduceMotion ? 1 : lerpFactor

    const handlePointer = (event: PointerEvent) => {
      target.x = event.clientX
      target.y = event.clientY
      if (!moved) {
        moved = true
        smooth.x = target.x
        smooth.y = target.y
      }
    }

    const tick = () => {
      if (moved) {
        smooth.x += (target.x - smooth.x) * strength
        smooth.y += (target.y - smooth.y) * strength
        onTickRef.current(smooth.x, smooth.y)
      }
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', handlePointer, { passive: true })
    window.addEventListener('pointerdown', handlePointer, { passive: true })
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', handlePointer)
      window.removeEventListener('pointerdown', handlePointer)
      cancelAnimationFrame(raf)
    }
  }, [lerpFactor])
}
