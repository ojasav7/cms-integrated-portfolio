import { useEffect, useRef, type RefObject } from 'react'
import { createTimeline } from 'animejs'
import { useReducedMotion } from 'framer-motion'
import { useInView } from '@/lib/anime'

/**
 * Hidden vs drawn states for self-drawing strokes. Every drawable path
 * carries `pathLength={1}`, so a dasharray of 1 covers the whole path:
 * offset 1 hides it, offset 0 shows it fully.
 */
const HIDDEN = { strokeDasharray: 1, strokeDashoffset: 1 }
const DRAWN = { strokeDasharray: 1, strokeDashoffset: 0 }

type SvgDrawBuilder = (tl: ReturnType<typeof createTimeline>, svg: SVGSVGElement) => void

/**
 * Runs an animejs timeline that draws SVG content the first time the
 * panel enters the viewport. Replays safely if the panel scrolls out
 * mid-draw (child animations target final values, so replay is
 * idempotent), and never replays once the draw has completed.
 */
function useSvgDrawOnView(
  svgRef: RefObject<SVGSVGElement | null>,
  inView: boolean,
  reduceMotion: boolean,
  build: SvgDrawBuilder,
) {
  const buildRef = useRef(build)
  buildRef.current = build
  const doneRef = useRef(false)

  useEffect(() => {
    if (doneRef.current || !inView || reduceMotion) return
    const svg = svgRef.current
    if (!svg) return
    const tl = createTimeline({
      defaults: { ease: 'outExpo' },
      onComplete: () => {
        doneRef.current = true
      },
    })
    buildRef.current(tl, svg)
    return () => {
      tl.cancel()
    }
  }, [inView, reduceMotion, svgRef])
}

/**
 * Decorative hand-drawn arrow sweep along the panel's bottom padding
 * strip. The strokes draw themselves with an animejs timeline the first
 * time the panel scrolls into view; the dots + sparkle pop in at the end.
 */
export function ContactOrnament() {
  const svgRef = useRef<SVGSVGElement>(null)
  const reduceMotion = useReducedMotion() ?? false
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25, once: false })

  useSvgDrawOnView(svgRef, inView, reduceMotion, (tl, svg) => {
    const paths = Array.from(svg.querySelectorAll<SVGPathElement>('.draw-path'))
    const accents = Array.from(svg.querySelectorAll<SVGGraphicsElement>('.draw-accent'))
    if (!paths.length) return
    // Main sweep draws, then the arrowhead catches up.
    tl.add(paths[0], { strokeDashoffset: 0, duration: 1700 })
    if (paths[1]) tl.add(paths[1], { strokeDashoffset: 0, duration: 800 }, '-=1150')
    // Dots + sparkle pop in as the sweep finishes.
    if (accents.length) {
      tl.add(
        accents,
        { opacity: 1, scale: 1, duration: 650, ease: 'outBack', stagger: 130 },
        '-=350',
      )
    }
  })

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-16 bottom-0 hidden h-16 lg:block"
    >
      {/* Sweeps along the panel's bottom padding strip, under all content. */}
      <svg
        ref={svgRef}
        viewBox="0 0 1000 64"
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
      >
        {/* Main sweep: left to right, gentle arc with a rising middle */}
        <path
          className="draw-path stroke-accent"
          pathLength={1}
          style={reduceMotion ? DRAWN : HIDDEN}
          d="M 24 48 C 320 56, 480 8, 720 20 C 840 26, 900 40, 940 44"
          fill="none"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        {/* Arrowhead, pointing up toward the form */}
        <path
          className="draw-path stroke-accent"
          pathLength={1}
          style={reduceMotion ? DRAWN : HIDDEN}
          d="M 940 44 L 920 36 M 940 44 L 928 58"
          fill="none"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Dots along the path */}
        <circle
          className="draw-accent fill-accent"
          style={
            reduceMotion
              ? undefined
              : {
                  opacity: 0,
                  transform: 'scale(0.4)',
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                }
          }
          cx={280}
          cy={50}
          r={3}
        />
        <circle
          className="draw-accent fill-accent"
          style={
            reduceMotion
              ? undefined
              : {
                  opacity: 0,
                  transform: 'scale(0.4)',
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                }
          }
          cx={560}
          cy={22}
          r={2.5}
        />
        <circle
          className="draw-accent fill-accent"
          style={
            reduceMotion
              ? undefined
              : {
                  opacity: 0,
                  transform: 'scale(0.4)',
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                }
          }
          cx={820}
          cy={30}
          r={2}
        />
        {/* Sparkle near the arrowhead */}
        <path
          className="draw-accent fill-accent"
          style={
            reduceMotion
              ? undefined
              : {
                  opacity: 0,
                  transform: 'scale(0.4)',
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                }
          }
          d="M 892 16 Q 897.6 20.8 908 22 Q 897.6 23.2 892 28 Q 886.4 23.2 876 22 Q 886.4 20.8 892 16 Z"
        />
      </svg>
    </div>
  )
}

/**
 * The contact section's mail icon — the envelope outline draws itself
 * with animejs when the section scrolls into view. Same shape as the
 * lucide `Mail` icon, but with a drawable stroke.
 */
export function DrawnMailIcon({ className }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const reduceMotion = useReducedMotion() ?? false
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.5, once: false })

  useSvgDrawOnView(svgRef, inView, reduceMotion, (tl, svg) => {
    const paths = Array.from(svg.querySelectorAll<SVGPathElement>('.draw-path'))
    if (!paths.length) return
    tl.add(paths[0], { strokeDashoffset: 0, duration: 800 })
    if (paths[1]) tl.add(paths[1], { strokeDashoffset: 0, duration: 650 }, '-=350')
  })

  return (
    <span ref={ref} aria-hidden="true" className="inline-flex">
      <svg
        ref={svgRef}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        {/* Envelope body */}
        <rect
          className="draw-path"
          pathLength={1}
          style={reduceMotion ? DRAWN : HIDDEN}
          x={2}
          y={4}
          width={20}
          height={16}
          rx={2}
        />
        {/* Envelope flap */}
        <path
          className="draw-path"
          pathLength={1}
          style={reduceMotion ? DRAWN : HIDDEN}
          d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
        />
      </svg>
    </span>
  )
}
