import { createServerFn } from '@tanstack/react-start'
import { deleteCookie, setCookie } from '@tanstack/react-start/server'
import { config } from '@/lib/config.server'
import { getAdminSession } from './auth.server'

const SESSION_COOKIE = 'admin_session'
const WEEK = 60 * 60 * 24 * 7

const sessionOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
}

export const login = createServerFn({ method: 'POST' })
  .validator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    if (!config.adminPassword || data.password !== config.adminPassword) {
      return { ok: false, error: 'Incorrect password' }
    }
    setCookie(SESSION_COOKIE, config.sessionSecret, {
      ...sessionOptions,
      maxAge: WEEK,
    })
    return { ok: true }
  })

export const logout = createServerFn({ method: 'POST' }).handler(async () => {
  deleteCookie(SESSION_COOKIE, { path: '/' })
  return { ok: true }
})

export const checkSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    return getAdminSession() === config.sessionSecret
  },
)
