export interface HeroContent {
  eyebrow: string
  name: string
  headline: string
  subheadline: string
}

export interface AboutTile {
  title: string
  body: string
}

export interface AboutContent {
  eyebrow: string
  title: string
  body: string
  tiles: AboutTile[]
}

export interface PortfolioItem {
  title: string
  category: string
  description: string
  image: string
  url: string
}

export interface PortfolioSection {
  title: string
  description: string
  items: PortfolioItem[]
}

export interface PortfolioContent {
  overview: {
    eyebrow: string
    title: string
    description: string
  }
  sections: Record<string, PortfolioSection>
}

export interface SocialLink {
  label: string
  url: string
}

export interface ContactContent {
  eyebrow: string
  headline: string
  blurb: string
  email: string
  location: string
}

export interface FooterContent {
  copyright: string
  socials: SocialLink[]
}

export interface MarqueeContent {
  top: string[]
  bottom: string[]
}

export interface SiteConfig {
  hero: HeroContent
  about: AboutContent
  portfolio: PortfolioContent
  contact: ContactContent
  footer: FooterContent
  marquee: MarqueeContent
}

export interface StatItem {
  value: string
  label: string
}

export interface CapabilityItem {
  title: string
  description: string
}

export interface TestimonialItem {
  quote: string
  name: string
  role: string
}

export interface HeroSlideItem {
  image: string
  title: string
  caption: string
  tag: string
}

export interface CaseStudyItem {
  title: string
  category: string
  description: string
  image: string
  url: string
}

export type CollectionName =
  | 'capabilities'
  | 'testimonials'
  | 'heroShowcase'
  | 'caseStudies'
  | 'stats'
  | 'reels'

export type CollectionItem =
  | StatItem
  | CapabilityItem
  | TestimonialItem
  | HeroSlideItem
  | CaseStudyItem

export type CollectionsMap = Record<CollectionName, CollectionItem[]>

export interface ReelItem {
  id?: string
  tag: string
  title: string
  description: string
  url: string
  kind: string
  embedUrl: string
  poster: string
  order?: number
}

export interface NormalizedReel {
  tag: string
  title: string
  description: string
  embedUrl: string
  poster: string
}

export interface GalleryAsset {
  src: string
  alt: string
  ratio: number
}
