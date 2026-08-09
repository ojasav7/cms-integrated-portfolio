import { useEffect, useRef, useState } from 'react'
import { spring } from 'animejs'

/**
 * Shared animejs v4 helpers.
 *
 * Springs are the animejs signature: physics-based easing that feels
 * alive rather than keyframed. `springSnappy` is for quick magnetic /
 * hover responses, `springSoft` for slower, floatier motion.
 */
export const springSnappy = spring({ stiffness: 400, damping: 26, mass: 0.8 })
export const springSoft = spring({ stiffness: 150, damping: 16, mass: 1 })

interface UseInViewOptions extends IntersectionObserverInit {
  /** Disconnect the observer after the first intersection. Default true. */
  once?: boolean
}

/** Observe an element and flip `inView` to true once it enters the viewport. */
export function useInView<T extends HTMLElement>(options: UseInViewOptions = {}) {
  const { once = true, threshold = 0.3, rootMargin = '0px 0px -8% 0px', ...rest } = options
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true)
          if (once) io.disconnect()
        }
      },
      { threshold, rootMargin, ...rest },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return { ref, inView }
}
