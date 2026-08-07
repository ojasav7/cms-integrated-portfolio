import { useRef } from 'react'
import { motion, useScroll } from 'framer-motion'
import type { AboutTile, CapabilityItem, SiteConfig } from '@/lib/cms/types'
import { SectionHeading } from './section-heading'
import { EASE, fadeUp, stagger, viewport } from '@/lib/motion'
import { cn } from '@/lib/utils'

interface AboutSectionProps {
  site: SiteConfig
  capabilities: CapabilityItem[]
}

export function AboutSection({ site, capabilities }: AboutSectionProps) {
  return (
    <section id="about" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading eyebrow={site.about.eyebrow} title={site.about.title} />
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ duration: 0.7, ease: EASE }}
              className="max-w-md text-base leading-relaxed text-muted-foreground md:text-lg"
            >
              {site.about.body}
            </motion.p>
          </div>

          <ZigzagTimeline tiles={site.about.tiles} />
        </div>

        <CapabilitiesGrid items={capabilities} />
      </div>
    </section>
  )
}

function ZigzagTimeline({ tiles }: { tiles: AboutTile[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.55'],
  })

  return (
    <div ref={ref} className="relative pb-2">
      {/* Rail */}
      <div className="absolute bottom-0 left-5 top-0 w-px -translate-x-1/2 bg-border md:left-1/2" />
      {/* Progress */}
      <motion.div
        style={{ scaleY: scrollYProgress }}
        className="absolute bottom-0 left-5 top-0 w-px origin-top -translate-x-1/2 bg-accent md:left-1/2"
      />

      <div className="flex flex-col gap-14">
        {tiles.map((tile, i) => {
          const onLeft = i % 2 === 0
          return (
            <motion.article
              key={tile.title}
              initial={{ opacity: 0, x: onLeft ? -44 : 44 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={viewport}
              transition={{ duration: 0.7, ease: EASE }}
              className={cn(
                'relative pl-14 md:w-1/2 md:pl-0',
                onLeft ? 'md:pr-14 md:text-right' : 'md:ml-auto md:pl-14',
              )}
            >
              {/* Dot on the rail */}
              <span
                className={cn(
                  'absolute top-4 h-3 w-3 rounded-full bg-accent ring-4 ring-background',
                  'left-5 -translate-x-1/2',
                  onLeft
                    ? 'md:left-auto md:right-0 md:translate-x-1/2'
                    : 'md:left-0 md:-translate-x-1/2',
                )}
              />
              <p className="mb-2 font-display text-sm font-semibold text-accent">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="font-display text-2xl font-medium tracking-tight">
                {tile.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                {tile.body}
              </p>
            </motion.article>
          )
        })}
      </div>
    </div>
  )
}

function CapabilitiesGrid({ items }: { items: CapabilityItem[] }) {
  if (!items.length) return null
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      className="mt-24 grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4"
    >
      {items.map((item) => (
        <motion.div
          key={item.title}
          variants={fadeUp}
          className="group bg-card p-7 transition-colors duration-300 hover:bg-muted"
        >
          <span className="mb-5 block h-1 w-8 rounded-full bg-accent transition-all duration-300 group-hover:w-14" />
          <h3 className="font-display text-lg font-medium tracking-tight">
            {item.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {item.description}
          </p>
        </motion.div>
      ))}
    </motion.div>
  )
}
