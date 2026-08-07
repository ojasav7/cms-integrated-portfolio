import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import type { TestimonialItem } from '@/lib/cms/types'
import { SectionHeading } from './section-heading'
import { fadeUp, stagger, viewport } from '@/lib/motion'

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
          className="grid gap-6 md:grid-cols-3"
        >
          {items.map((item) => (
            <motion.figure
              key={item.name}
              variants={fadeUp}
              className="flex flex-col rounded-3xl border border-border bg-card p-7 transition-colors duration-300 hover:border-accent/50"
            >
              <Quote className="h-6 w-6 text-accent" />
              <blockquote className="mt-5 flex-1 text-[15px] leading-relaxed text-foreground/90">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-6 border-t border-border pt-4">
                <p className="font-display text-sm font-semibold tracking-tight">
                  {item.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.role}</p>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
