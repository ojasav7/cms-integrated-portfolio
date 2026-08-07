import siteJson from '@/server/storage/site.json'
import testimonialsJson from '@/server/storage/testimonials.json'
import type {
  CapabilityItem,
  HeroSlideItem,
  SiteConfig,
  StatItem,
  TestimonialItem,
} from './types'

export const DEFAULT_SITE = siteJson as SiteConfig

export const DEFAULT_STATS: StatItem[] = [
  { value: '120+', label: 'Projects shipped' },
  { value: '14', label: 'Years combined experience' },
  { value: '9', label: 'Industry awards' },
  { value: '98%', label: 'Client retention' },
]

export const DEFAULT_CAPABILITIES: CapabilityItem[] = [
  {
    title: 'Brand Identity',
    description:
      'Names, systems and guidelines that give companies a durable point of view.',
  },
  {
    title: 'Art Direction',
    description:
      'Photography, set design and visual languages that make campaigns unmistakable.',
  },
  {
    title: 'Web & Product',
    description:
      'Design and engineering for interfaces that feel fast, alive and intentional.',
  },
  {
    title: 'Film & Motion',
    description:
      'Brand films, reels and interaction motion that turn ideas into feelings.',
  },
]

export const DEFAULT_TESTIMONIALS: TestimonialItem[] =
  testimonialsJson as TestimonialItem[]

export const DEFAULT_HERO_SLIDES: HeroSlideItem[] = [
  {
    image: 'https://picsum.photos/seed/showcase-1/1600/1000',
    title: 'Meridian — a brand that compounds',
    caption: 'Identity · Film · Web',
    tag: 'Branding',
  },
  {
    image: 'https://picsum.photos/seed/showcase-2/1600/1000',
    title: 'Atlas Commerce — motion-first storefront',
    caption: 'Strategy · Development',
    tag: 'Web',
  },
  {
    image: 'https://picsum.photos/seed/showcase-3/1600/1000',
    title: 'Aurora — climate tech, human scale',
    caption: 'Art Direction · Film',
    tag: 'Film',
  },
]
