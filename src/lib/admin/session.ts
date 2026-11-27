// Admin session primitives — pure, framework-free, so they can be tested
// without booting TanStack Start.
//
// The cookie must never contain SESSION_SECRET itself: a cookie value is
// readable by anything that can read headers or browser storage, and the
// secret is the only thing standing between the public site and the admin
// panel. Instead the cookie carries a derived token — HMAC-SHA256(secret,
// "admin-session:v1") — which is unforgeable without the secret and reveals
// nothing about it.
//
// Fail closed: an unset SESSION_SECRET authorises nobody, and an empty cookie
// value is never valid (it used to compare equal to an empty secret).
import { createHmac, timingSafeEqual } from 'node:crypto'

export const SESSION_COOKIE = 'admin_session'

const LABEL = 'admin-session:v1'

/** Constant-time string comparison (length mismatch short-circuits safely). */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'utf8')
  const bb = Buffer.from(b, 'utf8')
  return ab.length === bb.length && timingSafeEqual(ab, bb)
}

/** The value stored in the admin cookie. Deterministic per secret. */
export function sessionToken(secret: string): string {
  return createHmac('sha256', secret).update(LABEL).digest('base64url')
}

/** True only for a present cookie that matches this secret's token. */
export function isValidSession(
  cookie: string | null | undefined,
  secret: string,
): boolean {
  if (!secret || !cookie) return false
  return safeEqual(cookie, sessionToken(secret))
}

/** True only when both admin credentials are configured (login fails closed otherwise). */
export function authConfigured(adminPassword: string, secret: string): boolean {
  return Boolean(adminPassword && secret)
}
