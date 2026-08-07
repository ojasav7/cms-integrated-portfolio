import { getCookies } from '@tanstack/react-start/server'
import { config } from '@/lib/config.server'

const SESSION_COOKIE = 'admin_session'

export function getAdminSession() {
  return getCookies()[SESSION_COOKIE] ?? null
}

export function requireAdmin() {
  if (getAdminSession() !== config.sessionSecret) {
    throw new Response('Unauthorized', { status: 401 })
  }
}
