import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { LiquidGlass } from './LiquidGlass'

const NAV_ITEMS = ['Device', 'Real Stories', 'Science', 'Plans', 'Reach Us'] as const

const LOGO_PATH =
  'M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 96 95 L 63.5 128 L 64 128 L 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 64 L 64 0 L 192 0 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z'

interface MeasuredNavigationProps {
  onMenuOpen: () => void
  /** Removes the bar from the tab order while the mobile menu covers it. */
  inert?: boolean
  /** Scrolls with the section instead of staying fixed to the viewport. */
  embedded?: boolean
}

/** Bar (z-50) above the experience: logo · centred pill nav · CTA / hamburger. */
export function MeasuredNavigation({
  onMenuOpen,
  inert = false,
  embedded = false,
}: MeasuredNavigationProps) {
  return (
    <header
      inert={inert}
      className={cn('inset-x-0 top-0 z-50', embedded ? 'absolute' : 'fixed')}
    >
      <div className="flex items-center justify-between px-5 py-5 sm:px-8">
        {/* Top-left logo — back to the portfolio */}
        <Link to="/" aria-label="Measured — back to portfolio" className="shrink-0">
          <svg width="28" height="28" viewBox="0 0 256 256" fill="white" aria-hidden="true">
            <path d={LOGO_PATH} />
          </svg>
        </Link>

        {/* Desktop pill navigation */}
        <nav
          aria-label="Primary"
          className="absolute left-1/2 hidden -translate-x-1/2 lg:block"
        >
          <LiquidGlass className="flex items-center gap-1 rounded-full px-2 py-1.5">
            {NAV_ITEMS.map((item) => (
              <a
                key={item}
                href="#"
                className="rounded-full px-4 py-2 text-sm font-medium text-white/70 transition-colors duration-200 hover:text-white"
              >
                {item}
              </a>
            ))}
          </LiquidGlass>
        </nav>

        {/* Desktop portfolio CTA */}
        <a
          href="#"
          className="liquid-glass hidden items-center gap-2.5 rounded-full px-5 py-2.5 lg:flex"
        >
          <span className="h-2 w-2 rounded-full bg-green-400" aria-hidden="true" />
          <span className="text-sm font-medium text-white">Reserve Yours</span>
        </a>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={onMenuOpen}
          aria-label="Open menu"
          className="liquid-glass flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full lg:hidden"
        >
          <span className="h-[1.5px] w-5 bg-white" aria-hidden="true" />
          <span className="h-[1.5px] w-3.5 bg-white" aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}
