import { useState } from 'react'
import { cn } from '@/lib/utils'
import { BG_IMAGE_1, OVERLAY_IMAGE } from './measured-assets'
import { MeasuredGrid } from './MeasuredGrid'
import { MeasuredMobileMenu } from './MeasuredMobileMenu'
import { MeasuredNavigation } from './MeasuredNavigation'
import { MeasuredSpotlight } from './MeasuredSpotlight'

interface MeasuredProjectProps {
  /** Embed as a full-viewport section inside a larger scrollable page. */
  embedded?: boolean
}

/**
 * Measured — a premium health/wellness wearable concept, presented as a
 * self-contained fullscreen portfolio project experience (no vertical scroll
 * inside). Layer order:
 *
 *   0  grid parallax background
 *  10  atmospheric product image (BG_IMAGE_1)
 *  20  giant Instrument Serif title
 *  25  atmospheric haze overlay (OVERLAY_IMAGE)
 *  30  cursor spotlight video reveal (FRONT_VIDEO)
 *  50  fixed navigation
 *  55  mobile menu
 */
export function MeasuredProject({ embedded = false }: MeasuredProjectProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div
      className={cn(
        'measured-experience font-helvetica-neue relative h-screen overflow-hidden bg-black text-white',
        embedded ? 'w-full' : 'w-screen',
      )}
    >
      {/* Layer 1 — grid */}
      <MeasuredGrid />

      {/* Layer 2 — background image */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10"
        style={{
          backgroundImage: `url(${BG_IMAGE_1})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Layer 3 — project title */}
      <h1 className="measured-title pointer-events-none absolute left-0 right-0 top-20 z-20 select-none whitespace-nowrap text-center text-[4.5rem] uppercase leading-[0.9] text-white xs:text-[5.5rem] sm:top-28 sm:text-[10rem] md:top-32 md:text-[13rem] lg:text-[16rem]">
        Measured
      </h1>

      {/* Layer 4 — atmospheric overlay */}
      <img
        src={OVERLAY_IMAGE}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[25] h-full w-full object-cover"
      />

      {/* Layer 5 — cursor spotlight video reveal */}
      <MeasuredSpotlight />

      {/* Navigation + mobile menu */}
      <MeasuredNavigation
        onMenuOpen={() => setMenuOpen(true)}
        inert={menuOpen}
        embedded={embedded}
      />
      <MeasuredMobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  )
}
