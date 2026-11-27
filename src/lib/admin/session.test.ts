// Run: bun test src/lib/admin/session.test.ts
// Covers the three ways the old implementation could be bypassed: the cookie
// equalling the secret, an empty secret, and an empty cookie value.
import { describe, expect, test } from 'bun:test'
import {
  authConfigured,
  isValidSession,
  safeEqual,
  sessionToken,
} from './session'

const SECRET = 'a-long-random-session-secret'

describe('sessionToken', () => {
  test('is deterministic for the same secret', () => {
    expect(sessionToken(SECRET)).toBe(sessionToken(SECRET))
  })

  test('never equals the secret it derives from', () => {
    expect(sessionToken(SECRET)).not.toBe(SECRET)
    expect(sessionToken(SECRET).includes(SECRET)).toBe(false)
  })

  test('differs for a different secret', () => {
    expect(sessionToken(SECRET)).not.toBe(sessionToken('other-secret'))
  })
})

describe('isValidSession', () => {
  test('accepts the token minted from the configured secret', () => {
    expect(isValidSession(sessionToken(SECRET), SECRET)).toBe(true)
  })

  test('rejects the raw secret as a cookie (old format is dead)', () => {
    expect(isValidSession(SECRET, SECRET)).toBe(false)
  })

  test('rejects a token minted from another secret', () => {
    expect(isValidSession(sessionToken('other-secret'), SECRET)).toBe(false)
  })

  test('fails closed when SESSION_SECRET is unset', () => {
    expect(isValidSession(sessionToken(''), '')).toBe(false)
    expect(isValidSession('', '')).toBe(false)
    expect(isValidSession(null, '')).toBe(false)
  })

  test('rejects a missing or empty cookie', () => {
    expect(isValidSession(null, SECRET)).toBe(false)
    expect(isValidSession(undefined, SECRET)).toBe(false)
    expect(isValidSession('', SECRET)).toBe(false)
  })
})

describe('safeEqual', () => {
  test('matches identical strings and rejects any difference', () => {
    expect(safeEqual('abc', 'abc')).toBe(true)
    expect(safeEqual('abc', 'abd')).toBe(false)
    expect(safeEqual('abc', 'abcd')).toBe(false)
    expect(safeEqual('', '')).toBe(true)
  })
})

describe('authConfigured', () => {
  test('requires both ADMIN_PASSWORD and SESSION_SECRET', () => {
    expect(authConfigured('pw', SECRET)).toBe(true)
    expect(authConfigured('', SECRET)).toBe(false)
    expect(authConfigured('pw', '')).toBe(false)
    expect(authConfigured('', '')).toBe(false)
  })
})
