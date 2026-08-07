import { PrismaClient } from '@prisma/client'

const g = globalThis as { prisma?: PrismaClient }

export const hasDatabaseUrl = () => Boolean(process.env.DATABASE_URL)

export function getPrisma() {
  if (!hasDatabaseUrl()) return null
  if (!g.prisma) g.prisma = new PrismaClient()
  return g.prisma
}
