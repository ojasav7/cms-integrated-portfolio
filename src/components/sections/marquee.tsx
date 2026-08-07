import { cn } from '@/lib/utils'

interface MarqueeStripProps {
  words: string[]
  reverse?: boolean
  className?: string
}

export function MarqueeStrip({ words, reverse, className }: MarqueeStripProps) {
  if (!words.length) return null
  const doubled = [...words, ...words]
  return (
    <div
      className={cn(
        'overflow-hidden border-y border-border py-6 select-none',
        className,
      )}
      aria-hidden="true"
    >
      <div
        className={cn(
          'flex w-max items-center gap-10 whitespace-nowrap',
          reverse ? 'animate-marquee-rev' : 'animate-marquee',
        )}
      >
        {doubled.map((word, i) => (
          <span
            key={i}
            className="flex items-center gap-10 font-display text-3xl font-medium uppercase tracking-tight md:text-5xl"
          >
            {word}
            <span className="text-sm text-accent">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
