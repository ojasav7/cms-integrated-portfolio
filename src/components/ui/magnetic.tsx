import { useEffect, useRef, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { animate } from 'animejs'
import { useReducedMotion } from 'framer-motion'
import { springSnappy } from '@/lib/anime'
import { cn } from '@/lib/utils'

interface MagneticProps {
  children: ReactNode
  /** How strongly the element is pulled toward the cursor. 0.35 feels natural. */
  strength?: number
  className?: string
  style?: CSSProperties
}

/**
 * Wraps children in an invisible element that gently chases the cursor
 * using animejs spring physics, then springs back on leave.
 */
export function Magnetic({ children, strength = 0.35, className, style }: MagneticProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<ReturnType<typeof animate> | null>(null)
  const reduceMotion = useReducedMotion() ?? false

  // Cancel any in-flight spring if the component unmounts mid-animation.
  useEffect(
    () => () => {
      animRef.current?.cancel()
    },
    [],
  )

  const springTo = (x: number, y: number) => {
    const el = wrapRef.current
    if (!el) return
    // animejs v4: springs go through `ease:` — `spring:` is treated as a
    // tween property and crashes decomposeRawValue with the Spring object.
    // No manual cancel() either: animate() auto-overrides the previous tween.
    animRef.current = animate(el, { translateX: x, translateY: y, ease: springSnappy })
  }

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const dx = (e.clientX - (rect.left + rect.width / 2)) * strength
    const dy = (e.clientY - (rect.top + rect.height / 2)) * strength
    springTo(dx, dy)
  }

  const onMouseLeave = () => springTo(0, 0)

  return (
    <div
      ref={wrapRef}
      {...(reduceMotion ? {} : { onMouseMove, onMouseLeave })}
      className={cn('inline-block will-change-transform', className)}
      style={style}
    >
      {children}
    </div>
  )
}
