import { createServerFn } from '@tanstack/react-start'
import type { Prisma } from '@prisma/client'
import { getPrisma } from '@/lib/db.server'
import { requireAdmin } from './auth.server'
import {
  DEFAULT_CAPABILITIES,
  DEFAULT_HERO_SLIDES,
  DEFAULT_SITE,
  DEFAULT_STATS,
  DEFAULT_TESTIMONIALS,
} from '@/lib/cms/defaults'
import type {
  CollectionItem,
  CollectionName,
  CollectionsMap,
} from '@/lib/cms/types'

const COLLECTION_NAMES: CollectionName[] = [
  'capabilities',
  'testimonials',
  'heroShowcase',
  'caseStudies',
  'stats',
  'reels',
]

export function buildFallbackCollections(): CollectionsMap {
  const caseStudies = Object.values(DEFAULT_SITE.portfolio.sections).flatMap(
    (section) => section.items,
  )
  return {
    capabilities: DEFAULT_CAPABILITIES,
    testimonials: DEFAULT_TESTIMONIALS,
    heroShowcase: DEFAULT_HERO_SLIDES,
    caseStudies,
    stats: DEFAULT_STATS,
    reels: [],
  }
}

export const getCollections = createServerFn({ method: 'GET' }).handler(
  async () => {
    const prisma = getPrisma()
    if (!prisma) return buildFallbackCollections()
    try {
      const items = await prisma.contentBlock.findMany({
        orderBy: { order: 'asc' },
      })
      return items.reduce(
        (acc, item) => {
          const col = item.collection as CollectionName
          if (!COLLECTION_NAMES.includes(col)) return acc
          if (!acc[col]) acc[col] = []
          // Include the ContentBlock id so the admin editor can update/delete.
          acc[col].push({
            ...(item.data as unknown as Record<string, unknown>),
            id: item.id,
          } as unknown as CollectionItem)
          return acc
        },
        {} as CollectionsMap,
      )
    } catch {
      return buildFallbackCollections()
    }
  },
)

export const upsertCollectionItem = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      collection: CollectionName
      item: Record<string, unknown> & { id?: string }
    }) => data,
  )
  .handler(async ({ data }) => {
    requireAdmin()
    const prisma = getPrisma()
    if (!prisma) return { ok: false, error: 'Database not configured' }
    const { collection, item } = data
    const { id, ...payload } = item
    try {
      if (id) {
        await prisma.contentBlock.update({
          where: { id },
          data: { data: payload as unknown as Prisma.InputJsonValue },
        })
        return { ok: true }
      }
      const count = await prisma.contentBlock.count({
        where: { collection },
      })
      await prisma.contentBlock.create({
        data: {
          collection,
          order: count,
          data: payload as unknown as Prisma.InputJsonValue,
        },
      })
      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Save failed',
      }
    }
  })

export const deleteCollectionItem = createServerFn({ method: 'POST' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    requireAdmin()
    const prisma = getPrisma()
    if (!prisma) return { ok: false, error: 'Database not configured' }
    try {
      await prisma.contentBlock.delete({ where: { id: data.id } })
      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Delete failed',
      }
    }
  })
