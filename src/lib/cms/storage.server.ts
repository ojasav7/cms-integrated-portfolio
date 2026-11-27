import type { Prisma } from '@prisma/client'
import { getPrisma } from '@/lib/db.server'
import { DEFAULT_SITE } from './defaults'
import type { SiteConfig } from './types'
import fallbackJson from '@/server/storage/site.json'

const SITE_KEY = 'main'

export async function getSiteData(): Promise<SiteConfig> {
  const prisma = getPrisma()
  if (!prisma) return fallbackJson as SiteConfig
  try {
    const record = await prisma.siteConfig.findUnique({
      where: { key: SITE_KEY },
    })
    return (record?.data as unknown as SiteConfig) ?? DEFAULT_SITE
  } catch {
    // DB unreachable (bad URL, no network) — never block the site.
    return fallbackJson as SiteConfig
  }
}

/** Persist the site config. Returns false when there is no database to write to. */
export async function updateSiteData(data: SiteConfig): Promise<boolean> {
  const prisma = getPrisma()
  if (!prisma) return false
  await prisma.siteConfig.upsert({
    where: { key: SITE_KEY },
    create: {
      key: SITE_KEY,
      data: data as unknown as Prisma.InputJsonValue,
    },
    update: { data: data as unknown as Prisma.InputJsonValue },
  })
  return true
}

export interface SiteSaveResult {
  ok: boolean
  error: string
}

/**
 * The single mapping from "was it written?" to "what does the editor see?".
 * Pure and separate on purpose: tests pin that no path can report success for a
 * write that did not happen (the zero-DB mode is read-only).
 */
export function siteSaveResult(saved: boolean): SiteSaveResult {
  return saved
    ? { ok: true, error: '' }
    : {
        ok: false,
        error:
          'Database not configured — nothing was saved. Set DATABASE_URL (and start MongoDB) to edit content.',
      }
}
