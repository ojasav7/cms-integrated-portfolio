import { createServerFn } from '@tanstack/react-start'
import { getSiteData, updateSiteData } from '@/lib/cms/storage.server'
import type { SiteConfig } from '@/lib/cms/types'
import { requireAdmin } from './auth.server'

export const getSiteConfig = createServerFn({ method: 'GET' }).handler(
  async () => {
    return getSiteData()
  },
)

export const saveSiteConfig = createServerFn({ method: 'POST' })
  .validator((data: SiteConfig) => data)
  .handler(async ({ data }) => {
    requireAdmin()
    await updateSiteData(data)
    return { ok: true }
  })
