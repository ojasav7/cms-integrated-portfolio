import { useEffect } from 'react'
import { cn } from '@/lib/utils'

const MENU_ITEMS = ['Device', 'Real Stories', 'Science', 'Plans', 'Reach Us']
const MENU_EASE = 'cubic-bezier(0.77, 0, 0.18, 1)'
const ITEM_BASE_DELAY = 100
const ITEM_STAGGER = 60

interface MeasuredMobileMenuProps {
  open: boolean
  onClose: () => void
}

/**
 * Fullscreen mobile menu (z-55). Items rise from translateY(24px)/opacity 0
 * with a 60ms stagger starting at 100ms. Locks body scroll while open and is
 * `inert` (not focusable) while closed.
 */
export function MeasuredMobileMenu({ open, onClose }: MeasuredMobileMenuProps) {
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  return (
    <div
      aria-hidden={!open}
      inert={!open}
      className={cn(
        'fixed inset-0 z-[55] bg-[#0a0a0a] transition-opacity duration-300',
        open ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
    >
      {/* Close button — spins in from -90deg, scale 0.8 */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close menu"
        className={cn(
          'liquid-glass absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full transition-all duration-500 sm:right-8 sm:top-8',
          open ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-[0.8] opacity-0',
        )}
        style={{ transitionTimingFunction: MENU_EASE, transitionDelay: open ? '100ms' : '0ms' }}
      >
        <span
          className="absolute left-1/2 top-1/2 h-[1.5px] w-5 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-white"
          aria-hidden="true"
        />
        <span
          className="absolute left-1/2 top-1/2 h-[1.5px] w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white"
          aria-hidden="true"
        />
      </button>

      {/* Stacked, centred menu items */}
      <nav
        aria-label="Mobile"
        className="absolute inset-0 flex flex-col items-center justify-center gap-7"
      >
        {MENU_ITEMS.map((item, index) => (
          <a
            key={item}
            href="#"
            onClick={onClose}
            className={cn(
              'text-3xl font-medium text-white/90 transition-all duration-500 sm:text-4xl',
              open ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
            )}
            style={{
              transitionTimingFunction: MENU_EASE,
              transitionDelay: open ? `${ITEM_BASE_DELAY + index * ITEM_STAGGER}ms` : '0ms',
            }}
          >
            {item}
          </a>
        ))}
      </nav>

      {/* Mobile CTA */}
      <div
        className={cn(
          'absolute inset-x-0 bottom-10 z-10 flex justify-center transition-all duration-500',
          open ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
        )}
        style={{
          transitionTimingFunction: MENU_EASE,
          transitionDelay: open ? `${ITEM_BASE_DELAY + MENU_ITEMS.length * ITEM_STAGGER}ms` : '0ms',
        }}
      >
        <a
          href="#"
          onClick={onClose}
          className="liquid-glass flex items-center gap-2.5 rounded-full px-5 py-2.5"
        >
          <span className="h-2 w-2 rounded-full bg-green-400" aria-hidden="true" />
          <span className="text-sm font-medium text-white">Reserve Yours</span>
        </a>
      </div>
    </div>
  )
}
