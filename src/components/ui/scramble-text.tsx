import { Fragment, useLayoutEffect, useMemo, useRef } from 'react'
import { animate } from 'animejs'
import { useReducedMotion } from 'framer-motion'
import { useInView } from '@/lib/anime'
import { cn } from '@/lib/utils'

const SCRAMBLE_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$#@%&*!?<>'

function randomScrambleChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
}

interface ScrambleTextProps {
  text: string
  className?: string
}

/**
 * Section-heading reveal: characters cycle through random glyphs in a
 * left-to-right wave, then settle into the real title — driven by animejs.
 *
 * The char spans are React-owned (so no DOM conflicts), the initial
 * scramble is applied in a layout effect before paint (no flash), and
 * reduced-motion users just see the plain text.
 */
export function ScrambleText({ text, className }: ScrambleTextProps) {
  const reduceMotion = useReducedMotion() ?? false
  // Positive bottom margin: start the scramble just before the heading
  // enters view, so the plain title never flashes on screen first.
  const { ref, inView } = useInView<HTMLSpanElement>({
    threshold: 0.3,
    once: false,
    rootMargin: '0px 0px 10% 0px',
  })
  const doneRef = useRef(false)

  const words = useMemo(() => text.split(' '), [text])

  // Flat char list (including inter-word nbsp) — matches DOM order of .scr-char.
  const flatChars = useMemo(() => {
    const chars: string[] = []
    words.forEach((word, wi) => {
      Array.from(word).forEach((ch) => chars.push(ch))
      if (wi < words.length - 1) chars.push('\u00A0')
    })
    return chars
  }, [words])

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !inView || doneRef.current) return
    const targets = Array.from(el.querySelectorAll<HTMLElement>('.scr-char'))
    if (!targets.length || targets.length !== flatChars.length) return

    // If motion preferences resolved to "reduce" after the animation
    // started, restore the plain text instead of leaving scrambled chars.
    if (reduceMotion) {
      targets.forEach((t, i) => {
        t.textContent = flatChars[i]
      })
      return
    }

    // 1. Scramble everything immediately (before the browser paints).
    targets.forEach((t, i) => {
      t.textContent = flatChars[i] === '\u00A0' ? '\u00A0' : randomScrambleChar()
    })

    // 2. Reveal wave: each char sticks to its final glyph as progress rises.
    let remaining = targets.length
    const anims = targets.map((t, i) => {
      const finalCh = flatChars[i]
      const isSpace = finalCh === '\u00A0'
      const obj = { p: 0 }
      return animate(obj, {
        p: 1,
        duration: isSpace ? 350 : 750 + (i % 5) * 80,
        delay: 140 + i * 26,
        ease: 'outCubic',
        onUpdate: () => {
          if (isSpace) return
          // Past 90% progress the glyph commits; before that it cycles with
          // rising odds of sticking — organic, but no flicker near the end.
          t.textContent = obj.p > 0.9 || Math.random() < obj.p ? finalCh : randomScrambleChar()
        },
        onComplete: () => {
          t.textContent = finalCh
          remaining -= 1
          if (remaining === 0) doneRef.current = true
        },
      })
    })
    return () => anims.forEach((a) => a.cancel())
  }, [inView, reduceMotion, flatChars])

  return (
    <span ref={ref} aria-label={text} className={cn('inline-block', className)}>
      {words.map((word, wi) => (
        <Fragment key={wi}>
          <span aria-hidden="true" className="inline-block whitespace-nowrap">
            {Array.from(word).map((ch, ci) => (
              <span key={ci} className="scr-char">
                {ch}
              </span>
            ))}
          </span>
          {wi < words.length - 1 && (
            <span aria-hidden="true" className="scr-char">
              {'\u00A0'}
            </span>
          )}
        </Fragment>
      ))}
    </span>
  )
}
