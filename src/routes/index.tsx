import { useRef } from 'react'
import { useInView } from 'framer-motion'
import { createFileRoute } from '@tanstack/react-router'
import { getPortfolioContent } from '@/lib/cms/public.functions'
import {
  buildGalleryAssets,
  normalizeCapabilities,
  normalizeHeroSlides,
  normalizeReels,
  normalizeSite,
  normalizeStats,
  normalizeTestimonials,
} from '@/lib/normalizers'
import { Navbar } from '@/components/sections/navbar'
import { HeroSection } from '@/components/sections/hero'
import { MarqueeStrip } from '@/components/sections/marquee'
import { AboutSection } from '@/components/sections/about'
import { HeroCarouselSection } from '@/components/sections/hero-carousel'
import { ReelsSection } from '@/components/sections/reels'
import { ImageGallerySection } from '@/components/sections/image-gallery'
import { TestimonialsSection } from '@/components/sections/testimonials'
import { AsciiShowcaseSection } from '@/components/sections/ascii-showcase'
import { MeasuredSection } from '@/components/sections/measured-section'
import { ContactSection } from '@/components/sections/contact'
import { Footer } from '@/components/sections/footer'

export const Route = createFileRoute('/')({
  loader: () => getPortfolioContent(),
  component: HomePage,
})

function HomePage() {
  const data = Route.useLoaderData()
  const site = normalizeSite(data.site)
  const collections = data.collections

  const stats = normalizeStats(collections.stats ?? [])
  const capabilities = normalizeCapabilities(collections.capabilities ?? [])
  const testimonials = normalizeTestimonials(collections.testimonials ?? [])
  const heroSlides = normalizeHeroSlides(collections.heroShowcase ?? [])
  const reelItems = normalizeReels(data.reels ?? [])
  const galleryAssets = buildGalleryAssets(collections, site)

  // Hide the site navbar while the fullscreen Measured section is on screen,
  // so its own liquid-glass navigation sits exactly where the design intends.
  const measuredRef = useRef<HTMLElement>(null)
  const measuredInView = useInView(measuredRef, { amount: 0.3, once: false })

  return (
    <main className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      <Navbar hidden={measuredInView} />
      <HeroSection site={site} stats={stats} />
      <MarqueeStrip words={site.marquee.top} />
      <AboutSection site={site} capabilities={capabilities} />
      <HeroCarouselSection slides={heroSlides} />
      <MeasuredSection sectionRef={measuredRef} />
      <MarqueeStrip words={site.marquee.bottom} reverse className="bg-card/40" />
      <ReelsSection reels={reelItems} />
      <ImageGallerySection assets={galleryAssets} />
      <AsciiShowcaseSection content={site.asciiArt} />
      <TestimonialsSection items={testimonials} />
      <ContactSection site={site} />
      <Footer site={site} />
    </main>
  )
}
