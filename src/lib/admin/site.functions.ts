import { createServerFn } from '@tanstack/react-start'
import {
  getSiteData,
  siteSaveResult,
  updateSiteData,
} from '@/lib/cms/storage.server'
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
    const saved = await updateSiteData(data)
    // Never report success for a write that did not happen: in zero-DB mode the
    // site is read-only and the editor must say so instead of toasting "saved".
    return siteSaveResult(saved)
  })
