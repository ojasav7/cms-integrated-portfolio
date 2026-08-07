import type { HeroSlideItem } from '@/lib/cms/types'
import { HeroCarousel } from '@/components/carousels/hero-carousel'
import { SectionHeading } from './section-heading'

interface HeroCarouselSectionProps {
  slides: HeroSlideItem[]
}

export function HeroCarouselSection({ slides }: HeroCarouselSectionProps) {
  return (
    <section id="work" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading
          eyebrow="Featured work"
          title="Selected projects"
          description="A rotating look at recent collaborations — branding, web and film, chosen by the studio."
          align="center"
        />
        <HeroCarousel slides={slides} />
      </div>
    </section>
  )
}
