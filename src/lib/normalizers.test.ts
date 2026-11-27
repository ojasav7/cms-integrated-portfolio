// Run: bun test src/lib/normalizers.test.ts
// The normalizers are the only thing between whatever is in Mongo (or the JSON
// fallback) and the rendered page, so they are where "content exists but does
// not render" breaks. Each test below fails if the corresponding path regresses.
import { describe, expect, test } from 'bun:test'
import {
  buildGalleryAssets,
  normalizeCaseStudies,
  normalizeReels,
  normalizeSite,
  normalizeStats,
} from './normalizers'
import type { CollectionsMap } from './cms/types'

describe('normalizeCaseStudies', () => {
  test('falls back to the default work items when the collection is empty', () => {
    const items = normalizeCaseStudies([])
    expect(items.length > 0).toBe(true)
    expect(items[0].title.length > 0).toBe(true)
    expect(items[0].image.length > 0).toBe(true)
  })

  test('maps admin-shaped items and keeps description + url', () => {
    const items = normalizeCaseStudies([
      {
        title: 'Atlas',
        category: 'Branding',
        description: 'A rebrand',
        image: 'https://cdn.test/atlas.jpg',
        url: 'https://atlas.test',
      },
    ] as never)
    expect(items.length).toBe(1)
    expect(items[0].title).toBe('Atlas')
    expect(items[0].url).toBe('https://atlas.test')
    expect(items[0].description).toBe('A rebrand')
  })

  test('drops entries that would render an empty card', () => {
    expect(normalizeCaseStudies([{ title: '', image: '' }] as never).length).toBe(0)
  })
})

describe('buildGalleryAssets', () => {
  test('dedupes an image that appears in both a hero slide and a case study', () => {
    const collections = {
      heroShowcase: [{ image: 'https://cdn.test/one.jpg', title: 'Hero one' }],
      caseStudies: [{ image: 'https://cdn.test/one.jpg', title: 'Same image' }],
    } as unknown as CollectionsMap
    const assets = buildGalleryAssets(collections, normalizeSite(null))
    expect(assets.filter((a) => a.src === 'https://cdn.test/one.jpg').length).toBe(1)
  })

  test('always returns at least one asset (placeholder rail never collapses)', () => {
    expect(buildGalleryAssets({} as CollectionsMap, normalizeSite(null)).length > 0).toBe(true)
  })
})

describe('normalizeReels', () => {
  test('keeps a valid reel and defaults a missing tag to "All"', () => {
    const reels = normalizeReels([
      { title: 'Launch film', embedUrl: 'https://www.youtube-nocookie.com/embed/abc123' },
    ])
    expect(reels.length).toBe(1)
    expect(reels[0].tag).toBe('All')
    expect(reels[0].embedUrl).toBe('https://www.youtube-nocookie.com/embed/abc123')
  })

  test('returns an empty list for non-array input (never throws)', () => {
    expect(normalizeReels(null as never).length).toBe(0)
  })
})

describe('normalizeSite', () => {
  test('keeps supplied marquee words and fills the missing side from defaults', () => {
    const site = normalizeSite({ marquee: { top: ['Branding'], bottom: [] } } as never)
    expect(site.marquee.top).toEqual(['Branding'])
    expect(site.marquee.bottom.length > 0).toBe(true)
  })

  test('fills every section for an empty config so no section crashes', () => {
    const site = normalizeSite(null)
    expect(site.hero.name.length > 0).toBe(true)
    expect(site.contact.email.length > 0).toBe(true)
    expect(site.asciiArt.config.cellSize > 0).toBe(true)
  })
})

describe('normalizeStats', () => {
  test('falls back to defaults when the collection is empty', () => {
    expect(normalizeStats([]).length > 0).toBe(true)
  })
})
