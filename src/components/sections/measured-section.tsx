import type { Ref } from 'react'
import { MeasuredProject } from '@/components/measured/MeasuredProject'

interface MeasuredSectionProps {
  /** Observed by the homepage to hide the site navbar while this is on screen. */
  sectionRef?: Ref<HTMLElement>
}

/**
 * Full-viewport "featured project" section — the Measured wearable concept
 * embedded into the portfolio homepage. Scrolls with the page; the site
 * navbar hides while it occupies the viewport so the experience keeps its
 * own liquid-glass navigation untouched.
 */
export function MeasuredSection({ sectionRef }: MeasuredSectionProps) {
  return (
    <section
      id="measured"
      ref={sectionRef}
      aria-label="Measured — featured project"
    >
      <MeasuredProject embedded />
    </section>
  )
}
