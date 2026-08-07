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

export async function updateSiteData(data: SiteConfig) {
  const prisma = getPrisma()
  if (!prisma) return
  await prisma.siteConfig.upsert({
    where: { key: SITE_KEY },
    create: {
      key: SITE_KEY,
      data: data as unknown as Prisma.InputJsonValue,
    },
    update: { data: data as unknown as Prisma.InputJsonValue },
  })
}
