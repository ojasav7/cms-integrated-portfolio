import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { fadeUp, stagger, viewport } from '@/lib/motion'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: SectionHeadingProps) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      className={cn(
        'mb-14 max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow ? (
        <motion.p
          variants={fadeUp}
          className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-accent"
        >
          {eyebrow}
        </motion.p>
      ) : null}
      <motion.h2
        variants={fadeUp}
        className="font-display text-4xl font-medium tracking-tight text-balance md:text-5xl"
      >
        {title}
      </motion.h2>
      {description ? (
        <motion.p
          variants={fadeUp}
          className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg"
        >
          {description}
        </motion.p>
      ) : null}
    </motion.div>
  )
}
