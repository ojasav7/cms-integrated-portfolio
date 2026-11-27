import { getCookies } from '@tanstack/react-start/server'
import { config } from '@/lib/config.server'
import { SESSION_COOKIE, isValidSession } from './session'

export { SESSION_COOKIE }

export function getAdminSession() {
  return getCookies()[SESSION_COOKIE] ?? null
}

export function requireAdmin() {
  if (!isValidSession(getAdminSession(), config.sessionSecret)) {
    throw new Response('Unauthorized', { status: 401 })
  }
}
