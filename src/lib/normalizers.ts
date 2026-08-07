import {
  DEFAULT_CAPABILITIES,
  DEFAULT_HERO_SLIDES,
  DEFAULT_SITE,
  DEFAULT_STATS,
  DEFAULT_TESTIMONIALS,
} from '@/lib/cms/defaults'
import type {
  CapabilityItem,
  CaseStudyItem,
  CollectionItem,
  CollectionsMap,
  GalleryAsset,
  HeroSlideItem,
  NormalizedReel,
  PortfolioItem,
  SiteConfig,
  StatItem,
  TestimonialItem,
} from '@/lib/cms/types'

function asString(val: unknown, fallback = '') {
  return typeof val === 'string' && val.trim() ? val : fallback
}

function asStringArray(val: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(val)) return fallback
  const out = val.map((v) => asString(v)).filter(Boolean) as string[]
  return out.length ? out : fallback
}

function asRecord(item: CollectionItem) {
  return item as unknown as Record<string, unknown>
}

export function normalizeStats(items: CollectionItem[]): StatItem[] {
  if (!Array.isArray(items) || !items.length) return DEFAULT_STATS
  return items.map((item) => {
    const i = asRecord(item)
    return {
      value: asString(i.value, '0'),
      label: asString(i.label, '—'),
    }
  })
}

export function normalizeCapabilities(
  items: CollectionItem[],
): CapabilityItem[] {
  if (!Array.isArray(items) || !items.length) return DEFAULT_CAPABILITIES
  return items.map((item) => {
    const i = asRecord(item)
    return {
      title: asString(i.title, 'Untitled'),
      description: asString(i.description),
    }
  })
}

export function normalizeTestimonials(
  items: CollectionItem[],
): TestimonialItem[] {
  if (!Array.isArray(items) || !items.length) return DEFAULT_TESTIMONIALS
  return items.map((item) => {
    const i = asRecord(item)
    return {
      quote: asString(i.quote, ''),
      name: asString(i.name, 'Anonymous'),
      role: asString(i.role),
    }
  })
}

export function normalizeHeroSlides(
  items: CollectionItem[],
): HeroSlideItem[] {
  if (!Array.isArray(items) || !items.length) return DEFAULT_HERO_SLIDES
  return items.map((item) => {
    const i = asRecord(item)
    return {
      image: asString(i.image),
      title: asString(i.title, 'Untitled project'),
      caption: asString(i.caption),
      tag: asString(i.tag, 'Work'),
    }
  })
}

export function normalizeCaseStudies(
  items: CollectionItem[],
): CaseStudyItem[] {
  if (!Array.isArray(items)) return []
  return items
    .map((item) => {
      const i = asRecord(item)
      return {
        title: asString(i.title, 'Untitled'),
        category: asString(i.category),
        description: asString(i.description),
        image: asString(i.image),
        url: asString(i.url),
      }
    })
    .filter((item) => item.title || item.image)
}

export function normalizeReels(reels: unknown[]): NormalizedReel[] {
  if (!Array.isArray(reels)) return []
  return reels
    .map((r) => {
      const reel = r as Record<string, unknown>
      return {
        tag: asString(reel.tag, 'All'),
        title: asString(reel.title, 'Untitled reel'),
        description: asString(reel.description),
        embedUrl: asString(reel.embedUrl),
        poster: asString(reel.poster),
      }
    })
    .filter((r) => r.embedUrl || r.title)
}

export function normalizeSite(
  site: Partial<SiteConfig> | null | undefined,
): SiteConfig {
  const base = DEFAULT_SITE
  const src = site ?? {}
  return {
    hero: {
      ...base.hero,
      ...(src.hero ?? {}),
      subheadline: asString(src.hero?.subheadline, base.hero.subheadline),
    },
    about: {
      ...base.about,
      ...(src.about ?? {}),
      tiles:
        Array.isArray(src.about?.tiles) && src.about.tiles.length
          ? src.about.tiles
          : base.about.tiles,
    },
    portfolio: {
      overview: {
        ...base.portfolio.overview,
        ...(src.portfolio?.overview ?? {}),
      },
      sections: src.portfolio?.sections ?? base.portfolio.sections,
    },
    contact: {
      ...base.contact,
      ...(src.contact ?? {}),
    },
    footer: {
      ...base.footer,
      ...(src.footer ?? {}),
      socials:
        Array.isArray(src.footer?.socials) && src.footer.socials.length
          ? src.footer.socials
          : base.footer.socials,
    },
    marquee: {
      top: asStringArray(src.marquee?.top, base.marquee.top),
      bottom: asStringArray(src.marquee?.bottom, base.marquee.bottom),
    },
  }
}

/** Collect every image the page can show, in a deterministic order. */
export function buildGalleryAssets(
  collections: CollectionsMap,
  site: SiteConfig,
): GalleryAsset[] {
  const assets: GalleryAsset[] = []
  const seen = new Set<string>()

  const push = (src: string, alt: string, ratio: number) => {
    if (!src || seen.has(src)) return
    seen.add(src)
    assets.push({ src, alt, ratio })
  }

  for (const slide of normalizeHeroSlides(collections.heroShowcase ?? [])) {
    push(slide.image, slide.title, 16 / 10)
  }
  for (const study of normalizeCaseStudies(collections.caseStudies ?? [])) {
    push(study.image, study.title, 4 / 3)
  }
  const portfolioItems: PortfolioItem[] = Object.values(
    site.portfolio?.sections ?? {},
  ).flatMap((section) => section.items ?? [])
  for (const item of portfolioItems) {
    push(item.image, item.title, 4 / 3)
  }

  if (!assets.length) {
    for (let i = 1; i <= 5; i++) {
      push(
        `https://picsum.photos/seed/gallery-${i}/${i % 2 ? 900 : 1600}/${
          i % 2 ? 1200 : 900
        }`,
        `Studio work ${i}`,
        i % 2 ? 3 / 4 : 16 / 9,
      )
    }
  }
  return assets
}
