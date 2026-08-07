import { createServerFn } from '@tanstack/react-start'
import { getSiteData } from './storage.server'
import { getCollections } from '@/lib/admin/collections.functions'
import { getReels } from '@/lib/admin/reels.functions'

export const getPortfolioContent = createServerFn({ method: 'GET' }).handler(
  async () => {
    const [site, collections, reels] = await Promise.all([
      getSiteData(),
      getCollections(),
      getReels(),
    ])
    return { site, collections, reels }
  },
)
