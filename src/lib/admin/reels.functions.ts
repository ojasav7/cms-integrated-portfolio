import { createServerFn } from '@tanstack/react-start'
import { getPrisma } from '@/lib/db.server'
import { requireAdmin } from './auth.server'
import type { ReelItem } from '@/lib/cms/types'
import fallbackReels from '@/server/storage/reels.json'

/** Convert a YouTube / Vimeo URL into an embeddable iframe URL. */
export function computeEmbedUrl(input: string): string {
  const url = input.trim()
  if (!url) return ''

  const youtube = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/,
  )
  if (youtube) return `https://www.youtube-nocookie.com/embed/${youtube[1]}`

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`

  return ''
}

export const getReels = createServerFn({ method: 'GET' }).handler(async () => {
  const prisma = getPrisma()
  if (!prisma) return fallbackReels as unknown as ReelItem[]
  try {
    const reels = await prisma.videoReel.findMany({
      orderBy: { order: 'asc' },
    })
    return reels as unknown as ReelItem[]
  } catch {
    return fallbackReels as unknown as ReelItem[]
  }
})

export const upsertReel = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      reel: Omit<ReelItem, 'kind' | 'embedUrl'> & { id?: string }
    }) => data,
  )
  .handler(async ({ data }) => {
    requireAdmin()
    const prisma = getPrisma()
    if (!prisma) return { ok: false, error: 'Database not configured' }
    const { reel } = data
    const { id, ...payload } = reel
    const embedUrl = computeEmbedUrl(payload.url ?? '')
    try {
      if (id) {
        await prisma.videoReel.update({
          where: { id },
          data: { ...payload, embedUrl },
        })
        return { ok: true }
      }
      const count = await prisma.videoReel.count()
      await prisma.videoReel.create({
        data: { ...payload, order: count, kind: embedUrl ? 'youtube' : '', embedUrl },
      })
      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Save failed',
      }
    }
  })

export const deleteReel = createServerFn({ method: 'POST' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    requireAdmin()
    const prisma = getPrisma()
    if (!prisma) return { ok: false, error: 'Database not configured' }
    try {
      await prisma.videoReel.delete({ where: { id: data.id } })
      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Delete failed',
      }
    }
  })

export const reorderReel = createServerFn({ method: 'POST' })
  .validator((data: { id: string; direction: 'up' | 'down' }) => data)
  .handler(async ({ data }) => {
    requireAdmin()
    const prisma = getPrisma()
    if (!prisma) return { ok: false, error: 'Database not configured' }
    try {
      const current = await prisma.videoReel.findUnique({
        where: { id: data.id },
      })
      if (!current) return { ok: false, error: 'Reel not found' }
      const neighbor = await prisma.videoReel.findFirst({
        where:
          data.direction === 'up'
            ? { order: { lt: current.order } }
            : { order: { gt: current.order } },
        orderBy: { order: data.direction === 'up' ? 'desc' : 'asc' },
      })
      if (!neighbor) return { ok: true }
      await prisma.videoReel.update({
        where: { id: current.id },
        data: { order: neighbor.order },
      })
      await prisma.videoReel.update({
        where: { id: neighbor.id },
        data: { order: current.order },
      })
      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Reorder failed',
      }
    }
  })
