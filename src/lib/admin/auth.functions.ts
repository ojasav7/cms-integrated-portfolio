import { createServerFn } from '@tanstack/react-start'
import { deleteCookie, setCookie } from '@tanstack/react-start/server'
import { config } from '@/lib/config.server'
import { getAdminSession } from './auth.server'
import {
  SESSION_COOKIE,
  authConfigured,
  isValidSession,
  safeEqual,
  sessionToken,
} from './session'

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
    // Fail closed: no credentials configured means nobody signs in —
    // never "empty password matches empty env var".
    if (!authConfigured(config.adminPassword, config.sessionSecret)) {
      return {
        ok: false,
        error: 'Admin auth is not configured (set ADMIN_PASSWORD and SESSION_SECRET)',
      }
    }
    if (!safeEqual(data.password, config.adminPassword)) {
      return { ok: false, error: 'Incorrect password' }
    }
    // The cookie carries a derived token, never the secret itself.
    setCookie(SESSION_COOKIE, sessionToken(config.sessionSecret), {
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
    return isValidSession(getAdminSession(), config.sessionSecret)
  },
)
