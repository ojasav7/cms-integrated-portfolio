import { motion } from 'framer-motion'
import type { CaseStudyItem } from '@/lib/cms/types'
import { fadeUp, stagger, viewport } from '@/lib/motion'
import { SectionHeading } from './section-heading'

interface CaseStudiesSectionProps {
  items: CaseStudyItem[]
}

/**
 * Reader for the admin-managed `caseStudies` collection.
 *
 * Before this existed the collection was editable but invisible: its items only
 * reached the page as gallery thumbnails, so editing a case study changed
 * nothing a visitor could see. This closes the admin → public loop for it.
 */
export function CaseStudiesSection({ items }: CaseStudiesSectionProps) {
  if (!items.length) return null

  return (
    <section id="work" className="relative overflow-hidden py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading
          eyebrow="Selected work"
          title="Case studies"
          description="Projects from the studio — each one is a CMS entry under Collections → Case studies."
        />

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((item, index) => (
            <motion.article
              key={`${item.title}-${index}`}
              variants={fadeUp}
              className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              ) : null}

              <div className="flex flex-1 flex-col gap-2 p-6">
                {item.category ? (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                    {item.category}
                  </p>
                ) : null}
                <h3 className="font-display text-xl font-medium tracking-tight">
                  {item.title}
                </h3>
                {item.description ? (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-auto pt-3 text-sm text-accent underline-offset-4 hover:underline"
                  >
                    View project
                  </a>
                ) : null}
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
