import { AsciiArt } from '@/components/ascii-art/ascii-art'
import type { AsciiArtConfig } from '@/components/ascii-art/config'
import { SectionHeading } from './section-heading'

export interface AsciiShowcaseContent {
  enabled: boolean
  eyebrow: string
  title: string
  description: string
  image: string
  config: AsciiArtConfig
}

interface AsciiShowcaseSectionProps {
  content: AsciiShowcaseContent
}

export function AsciiShowcaseSection({ content }: AsciiShowcaseSectionProps) {
  if (!content.enabled || !content.image) return null

  return (
    <section id="ascii" className="relative overflow-hidden py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading
          eyebrow={content.eyebrow}
          title={content.title}
          description={content.description}
        />
      </div>
      <div className="mx-auto mt-12 max-w-3xl px-6 md:px-10">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-black/20">
          <AsciiArt
            src={content.image}
            config={content.config}
            className="h-full w-full"
            alt={content.title}
          />
        </div>
      </div>
    </section>
  )
}