import { useRef, type MouseEvent } from 'react'
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import type { SiteConfig, StatItem } from '@/lib/cms/types'
import { buttonVariants } from '@/components/ui/button'
import { EASE } from '@/lib/motion'
import { cn } from '@/lib/utils'

interface HeroSectionProps {
  site: SiteConfig
  stats: StatItem[]
}

export function HeroSection({ site, stats }: HeroSectionProps) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 160])
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -70])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0])

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 50, damping: 18 })
  const springY = useSpring(mouseY, { stiffness: 50, damping: 18 })

  const onMouseMove = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const words = site.hero.headline.split(' ')

  return (
    <section
      id="top"
      ref={ref}
      onMouseMove={onMouseMove}
      className="relative flex min-h-screen items-center overflow-hidden pb-28 pt-28"
    >
      {/* Parallax background */}
      <motion.div
        style={{ y: bgY }}
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div className="absolute -top-40 right-[-12%] h-[36rem] w-[36rem] rounded-full bg-accent/15 blur-[130px]" />
        <div className="absolute bottom-[-22%] left-[-10%] h-[32rem] w-[32rem] rounded-full bg-accent/10 blur-[130px]" />
        <div className="absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_40%,black,transparent)] bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </motion.div>

      {/* Floating stat cards */}
      {stats[0] && (
        <FloatingStatCard
          mouseX={springX}
          mouseY={springY}
          depth={26}
          value={stats[0].value}
          label={stats[0].label}
          className="right-8 top-32 hidden md:flex lg:right-20"
        />
      )}
      {stats[1] && (
        <FloatingStatCard
          mouseX={springX}
          mouseY={springY}
          depth={44}
          value={stats[1].value}
          label={stats[1].label}
          className="bottom-44 right-1/4 hidden lg:flex"
        />
      )}
      {stats[3] && (
        <FloatingStatCard
          mouseX={springX}
          mouseY={springY}
          depth={18}
          value={stats[3].value}
          label={stats[3].label}
          className="bottom-32 left-8 hidden xl:flex"
        />
      )}

      {/* Content */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative mx-auto w-full max-w-7xl px-6 md:px-10"
      >
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-6 inline-flex items-center gap-3 rounded-full border border-border bg-card/60 px-4 py-2 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground backdrop-blur"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {site.hero.eyebrow}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          className="font-display text-lg font-medium text-foreground md:text-xl"
        >
          {site.hero.name}
        </motion.p>

        <h1 className="mt-4 max-w-5xl font-display text-[clamp(2.6rem,7vw,6.5rem)] font-medium leading-[1.02] tracking-tight text-balance">
          {words.map((word, i) => (
            <span
              key={i}
              className="inline-block overflow-hidden pb-1 -mb-1 align-top"
            >
              <motion.span
                className="inline-block"
                initial={{ y: '115%' }}
                animate={{ y: 0 }}
                transition={{
                  duration: 0.9,
                  ease: EASE,
                  delay: 0.3 + i * 0.07,
                }}
              >
                {word}
                {i < words.length - 1 ? '\u00A0' : ''}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.65 }}
          className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg"
        >
          {site.hero.subheadline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.8 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <a
            href="#work"
            className={buttonVariants({ variant: 'primary', size: 'lg' })}
          >
            See the work
            <ArrowUpRight className="h-4 w-4" />
          </a>
          <a
            href="#contact"
            className={buttonVariants({ variant: 'outline', size: 'lg' })}
          >
            Start a project
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
      >
        <ArrowDown className="h-5 w-5 text-muted-foreground" />
      </motion.div>
    </section>
  )
}

interface FloatingStatCardProps {
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
  depth: number
  value: string
  label: string
  className?: string
}

function FloatingStatCard({
  mouseX,
  mouseY,
  depth,
  value,
  label,
  className,
}: FloatingStatCardProps) {
  const x = useTransform(mouseX, (v) => v * depth * 2)
  const y = useTransform(mouseY, (v) => v * depth * 2)

  return (
    <motion.div
      style={{ x, y }}
      className={cn('pointer-events-none absolute z-10', className)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 1 }}
        className="rounded-2xl border border-border bg-card/80 p-5 shadow-xl shadow-black/5 backdrop-blur"
      >
        <div className="font-display text-3xl font-semibold text-accent">
          {value}
        </div>
        <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </div>
      </motion.div>
    </motion.div>
  )
}
