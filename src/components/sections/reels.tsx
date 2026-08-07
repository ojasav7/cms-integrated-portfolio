import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Search, Video } from 'lucide-react'
import type { NormalizedReel } from '@/lib/cms/types'
import { SectionHeading } from './section-heading'
import { fadeUp, stagger, viewport } from '@/lib/motion'
import { cn } from '@/lib/utils'

interface ReelsSectionProps {
  reels: NormalizedReel[]
}

export function ReelsSection({ reels }: ReelsSectionProps) {
  const [tag, setTag] = useState('All')
  const [query, setQuery] = useState('')

  const tags = useMemo(
    () => ['All', ...Array.from(new Set(reels.map((r) => r.tag).filter(Boolean)))],
    [reels],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return reels.filter(
      (r) =>
        (tag === 'All' || r.tag === tag) &&
        (!q ||
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)),
    )
  }, [reels, tag, query])

  return (
    <section id="reels" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Reels"
            title="Work in motion"
            description="Films, motion studies and interaction reels. Filter by discipline or search the archive."
            className="mb-0"
          />
          <div className="relative w-full shrink-0 md:w-72">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search reels…"
              aria-label="Search reels"
              className="h-11 w-full rounded-full border border-border bg-card pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t)}
              className={cn(
                'rounded-full border px-4 py-2 text-xs font-medium transition-all duration-300',
                tag === t
                  ? 'border-accent bg-accent text-accent-foreground'
                  : 'border-border text-muted-foreground hover:border-accent/60 hover:text-foreground',
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {filtered.length ? (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((reel) => (
              <ReelCard key={reel.title} reel={reel} />
            ))}
          </motion.div>
        ) : (
          <div className="mt-10 grid place-items-center gap-3 rounded-3xl border border-dashed border-border p-16 text-center">
            <Video className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No reels match “{query}”. Try another search.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

function ReelCard({ reel }: { reel: NormalizedReel }) {
  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="group overflow-hidden rounded-3xl border border-border bg-card"
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {reel.embedUrl ? (
          <iframe
            src={reel.embedUrl}
            title={reel.title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : reel.poster ? (
          <>
            <img
              src={reel.poster}
              alt={reel.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 grid place-items-center bg-black/30">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-white/20 text-white backdrop-blur transition-transform duration-300 group-hover:scale-110">
                <Play className="ml-0.5 h-5 w-5" />
              </span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <Play className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}
      </div>
      <div className="p-5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
          {reel.tag}
        </span>
        <h3 className="mt-2 font-display text-lg font-medium tracking-tight">
          {reel.title}
        </h3>
        {reel.description && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {reel.description}
          </p>
        )}
      </div>
    </motion.article>
  )
}
