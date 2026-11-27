// Run: bun test src/lib/cms/storage.test.ts
//
// The zero-database save path is the one place a CMS can lie: the editor says
// "saved" and nothing was written. These tests drive both directions of
// updateSiteData, plus the single response mapping saveSiteConfig uses.
//
// No network, no database, no mocks framework: when DATABASE_URL is set the
// module hands back the client already cached on globalThis, so the recording
// fakes below are returned exactly as a live client would be — and when it is
// unset the real "read-only" branch runs and must ignore the fake entirely.
import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { getSiteData, siteSaveResult, updateSiteData } from './storage.server'
import type { SiteConfig } from './types'
import fallbackSite from '@/server/storage/site.json'

const SITE = { hero: { name: 'Test Studio' } } as unknown as SiteConfig
const DB_URL = 'mongodb://127.0.0.1:27017/cms-test'

interface UpsertArgs {
  where: { key: string }
  create: { key: string; data: unknown }
  update: { data: unknown }
}

let previousUrl: string | undefined
let writes: UpsertArgs[]
/** What the fake database currently holds for the `main` key. */
let stored: { key: string; data: unknown } | null

const prismaSlot = globalThis as { prisma?: unknown }

function installFakeClient(behaviour: 'ok' | 'throw' = 'ok') {
  writes = []
  stored = null
  prismaSlot.prisma = {
    siteConfig: {
      upsert: async (args: UpsertArgs) => {
        if (behaviour === 'throw') throw new Error('mongo is down')
        writes.push(args)
        // Upsert semantics: the write lands in the store, which is what a later
        // read has to observe.
        stored = { key: args.create.key, data: args.update.data }
        return args.create
      },
      findUnique: async (args: { where: { key: string } }) => {
        if (behaviour === 'throw') throw new Error('mongo is down')
        return stored && stored.key === args.where.key ? stored : null
      },
    },
  }
}

beforeEach(() => {
  previousUrl = process.env.DATABASE_URL
  delete prismaSlot.prisma
  writes = []
  stored = null
})

afterEach(() => {
  delete prismaSlot.prisma
  if (previousUrl === undefined) delete process.env.DATABASE_URL
  else process.env.DATABASE_URL = previousUrl
})

describe('zero-DB save path', () => {
  test('updateSiteData returns false and writes nothing when no database is configured', async () => {
    delete process.env.DATABASE_URL
    // A cached client is present on purpose: the module must check the env, not
    // just "is there an object", and must never write through it here.
    installFakeClient()

    const saved = await updateSiteData(SITE)

    expect(saved).toBe(false)
    expect(writes.length).toBe(0)
  })

  test('a zero-DB save resolves to ok:false with a reason, never a success toast', async () => {
    delete process.env.DATABASE_URL
    installFakeClient()

    const res = siteSaveResult(await updateSiteData(SITE))

    expect(res.ok).toBe(false)
    expect(res.error.length > 0).toBe(true)
    expect(res.error).toContain('Database not configured')
    expect(writes.length).toBe(0)
  })
})

describe('admin save → public read-back', () => {
  // The exact two calls the admin handler and the public loader make:
  // saveSiteConfig → updateSiteData + siteSaveResult; homepage → getSiteData.
  const EDITED = {
    hero: { name: 'Saved Through Admin', eyebrow: 'edited', headline: 'h', subheadline: 's' },
  } as unknown as SiteConfig

  test('a saved site edit is ok:true and is what the public reader returns', async () => {
    process.env.DATABASE_URL = DB_URL
    installFakeClient()

    const saved = await updateSiteData(EDITED)
    expect(siteSaveResult(saved)).toEqual({ ok: true, error: '' })
    expect(writes).toHaveLength(1)
    expect(writes[0].where).toEqual({ key: 'main' })

    // Read back through the public loader's own storage call and compare to the
    // data that landed in the store — not to the object we passed in.
    const publicSite = await getSiteData()
    expect(publicSite).toEqual(EDITED)
    expect(publicSite).toEqual(stored?.data as SiteConfig)
  })

  test('with no database the same edit is refused and the public page keeps the JSON fallback', async () => {
    delete process.env.DATABASE_URL
    installFakeClient()

    const saved = await updateSiteData(EDITED)
    expect(siteSaveResult(saved).ok).toBe(false)
    expect(stored).toBe(null)

    const publicSite = await getSiteData()
    expect(publicSite).toEqual(fallbackSite as unknown as SiteConfig)
    expect(publicSite).not.toEqual(EDITED)
  })
})

describe('siteSaveResult', () => {
  test('reports ok only for a completed write', () => {
    expect(siteSaveResult(true)).toEqual({ ok: true, error: '' })
  })

  test('refuses to report ok for an unsaved write', () => {
    const res = siteSaveResult(false)
    expect(res.ok).toBe(false)
    expect(res.error).toContain('nothing was saved')
  })
})

describe('with a database configured', () => {
  test('updateSiteData performs one upsert on the main key and returns true', async () => {
    process.env.DATABASE_URL = DB_URL
    installFakeClient()

    const saved = await updateSiteData(SITE)

    expect(saved).toBe(true)
    expect(writes.length).toBe(1)
    expect(writes[0].where).toEqual({ key: 'main' })
    expect(writes[0].update.data).toBe(SITE)
  })

  test('a failing write rejects instead of resolving true', async () => {
    process.env.DATABASE_URL = DB_URL
    installFakeClient('throw')

    await expect(updateSiteData(SITE)).rejects.toThrow('mongo is down')
    expect(writes.length).toBe(0)
  })

  test('getSiteData falls back to the JSON file when the database is unreachable', async () => {
    process.env.DATABASE_URL = DB_URL
    installFakeClient('throw')

    const site = await getSiteData()

    expect(site).toEqual(fallbackSite as unknown as SiteConfig)
  })
})
