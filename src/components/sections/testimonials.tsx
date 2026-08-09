import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { animate, spring } from 'animejs'
import { Quote } from 'lucide-react'
import type { TestimonialItem } from '@/lib/cms/types'
import { SectionHeading } from './section-heading'
import { fadeUp, stagger, viewport } from '@/lib/motion'
import { cn } from '@/lib/utils'

const TILT_SPRING = spring({ stiffness: 220, damping: 16, mass: 0.9 })

interface TestimonialsSectionProps {
  items: TestimonialItem[]
}

export function TestimonialsSection({ items }: TestimonialsSectionProps) {
  if (!items.length) return null
  return (
    <section id="testimonials" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading
          eyebrow="Kind words"
          title="What clients say"
          align="center"
        />
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="grid gap-6 [perspective:1400px] md:grid-cols-3"
        >
          {items.map((item) => (
            <motion.figure key={item.name} variants={fadeUp} className="h-full">
              <TiltCard className="flex h-full flex-col rounded-3xl border border-border bg-card p-7 transition-colors duration-300 hover:border-accent/50 [transform-style:preserve-3d]">
                <Quote className="h-6 w-6 text-accent [transform:translateZ(36px)]" />
                <blockquote className="mt-5 flex-1 text-[15px] leading-relaxed text-foreground/90 [transform:translateZ(20px)]">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-6 border-t border-border pt-4 [transform:translateZ(28px)]">
                  <p className="font-display text-sm font-semibold tracking-tight">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.role}</p>
                </figcaption>
              </TiltCard>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/**
 * 3D tilt that follows the cursor with animejs spring physics.
 * The grid has perspective; the card keeps preserve-3d so inner
 * elements can pop toward the viewer via translateZ.
 */
function TiltCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const animRef = useRef<ReturnType<typeof animate> | null>(null)
  const reduceMotion = useReducedMotion() ?? false

  // Cancel any in-flight tilt if the card unmounts mid-animation.
  useEffect(
    () => () => {
      animRef.current?.cancel()
    },
    [],
  )

  const tiltTo = (rx: number, ry: number) => {
    const el = ref.current
    if (!el) return
    // animejs v4: springs go through `ease:` — `spring:` is treated as a
    // tween property and crashes decomposeRawValue with the Spring object.
    // No manual cancel() either: animate() auto-overrides the previous tween.
    animRef.current = animate(el, {
      rotateX: rx,
      rotateY: ry,
      scale: 1.02,
      ease: TILT_SPRING,
    })
  }

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    tiltTo(-py * 7, px * 7)
  }

  const onMouseLeave = () => tiltTo(0, 0)

  return (
    <div
      ref={ref}
      {...(reduceMotion ? {} : { onMouseMove, onMouseLeave })}
      className={cn('will-change-transform', className)}
    >
      {children}
    </div>
  )
}
