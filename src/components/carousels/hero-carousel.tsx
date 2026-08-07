import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'
import type { HeroSlideItem } from '@/lib/cms/types'
import { cn } from '@/lib/utils'

export function HeroCarousel({ slides }: { slides: HeroSlideItem[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
  })
  const [selected, setSelected] = useState(0)
  const [count, setCount] = useState(slides.length)

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => {
      setSelected(emblaApi.selectedScrollSnap())
      setCount(emblaApi.scrollSnapList().length)
    }
    onSelect()
    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  // Gentle autoplay
  useEffect(() => {
    if (!emblaApi || slides.length < 2) return
    const id = setInterval(() => {
      if (emblaApi.canScrollNext()) emblaApi.scrollNext()
      else emblaApi.scrollTo(0)
    }, 5200)
    return () => clearInterval(id)
  }, [emblaApi, slides.length])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide, i) => (
            <div
              key={slide.title + i}
              className="min-w-0 flex-[0_0_100%] px-0 md:flex-[0_0_88%] md:px-2"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-card md:aspect-[16/9]">
                {slide.image ? (
                  <img
                    src={slide.image}
                    alt={slide.title}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-muted via-card to-muted">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/10" />

                {slide.tag && (
                  <span className="absolute left-5 top-5 rounded-full border border-white/25 bg-black/30 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-white backdrop-blur">
                    {slide.tag}
                  </span>
                )}

                <span className="absolute right-5 top-5 font-display text-sm font-medium text-white/70">
                  {String(i + 1).padStart(2, '0')}
                  <span className="text-white/35"> / {String(slides.length).padStart(2, '0')}</span>
                </span>

                <div className="absolute inset-x-0 bottom-0 p-6 md:p-9">
                  <h3 className="max-w-lg font-display text-2xl font-medium tracking-tight text-white md:text-4xl">
                    {slide.title}
                  </h3>
                  {slide.caption && (
                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.22em] text-white/60 md:text-sm">
                      {slide.caption}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={scrollPrev}
        aria-label="Previous slide"
        className="absolute -left-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur transition-all hover:border-accent hover:text-accent md:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={scrollNext}
        aria-label="Next slide"
        className="absolute -right-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur transition-all hover:border-accent hover:text-accent md:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="mt-7 flex justify-center gap-2.5">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === selected ? 'w-8 bg-accent' : 'w-4 bg-border hover:bg-muted-foreground/40',
            )}
          />
        ))}
      </div>
    </div>
  )
}
