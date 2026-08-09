import { useEffect, useMemo } from 'react'
import { animate } from 'animejs'
import { useReducedMotion } from 'framer-motion'
import { useInView } from '@/lib/anime'

interface CountUpProps {
  /** A numeric string, optionally with decimals and a suffix, e.g. "120+" or "98%". */
  value: string
  className?: string
}

/** Parses "120+" / "98%" / "4.9" into a numeric target + suffix + decimal places. */
function parseValue(value: string) {
  const match = value.match(/^([\d.,]+)(.*)$/)
  if (!match) return null
  const raw = match[1].replace(/,/g, '')
  const target = Number.parseFloat(raw)
  if (Number.isNaN(target)) return null
  const decimals = raw.includes('.') ? (raw.split('.')[1]?.length ?? 0) : 0
  return { target, decimals, suffix: match[2] }
}

/**
 * Counts a number up from 0 the first time it scrolls into view,
 * using animejs with an outExpo ease. Keeps the original suffix and
 * decimal precision intact ("120+" → 0…120+).
 */
export function CountUp({ value, className }: CountUpProps) {
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.4 })
  const parsed = useMemo(() => parseValue(value), [value])
  const reduceMotion = useReducedMotion() ?? false

  useEffect(() => {
    const el = ref.current
    if (!el || !inView || !parsed || reduceMotion) return

    const obj = { v: 0 }
    const anim = animate(obj, {
      v: parsed.target,
      duration: 1800,
      ease: 'outExpo',
      onUpdate: () => {
        const shown =
          parsed.decimals > 0
            ? obj.v.toFixed(parsed.decimals)
            : Math.round(obj.v).toString()
        el.textContent = `${shown}${parsed.suffix}`
      },
    })
    return () => {
      anim.cancel()
    }
  }, [inView, parsed, reduceMotion])

  return (
    <span ref={ref} className={className} aria-label={value}>
      {reduceMotion || inView ? value : '0'}
    </span>
  )
}
