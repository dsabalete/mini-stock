import type { H3Event } from 'h3'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()
let cleanupInterval: ReturnType<typeof setInterval> | null = null

function cleanup() {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key)
  }
}

function ensureCleanupInterval() {
  if (!cleanupInterval) {
    cleanupInterval = setInterval(cleanup, 60_000)
  }
}

export function createRateLimiter(options: {
  windowMs: number
  maxRequests: number
  keyPrefix?: string
}) {
  const { windowMs, maxRequests, keyPrefix = 'rl' } = options

  return async function rateLimit(event: H3Event) {
    ensureCleanupInterval()
    const ip = getRequestIP(event)
    const path = event.path
    const key = `${keyPrefix}:${ip}:${path}`

    const now = Date.now()
    const entry = store.get(key)

    if (!entry || entry.resetAt < now) {
      store.set(key, { count: 1, resetAt: now + windowMs })
      return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs }
    }

    if (entry.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt }
    }

    entry.count++
    return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt }
  }
}

function getRequestIP(event: H3Event): string {
  const forwarded = getHeader(event, 'cf-connecting-ip')
  if (forwarded) return forwarded
  const xff = getHeader(event, 'x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return getHeader(event, 'x-real-ip') || 'unknown'
}

export const requestRateLimit = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 30,
  keyPrefix: 'api'
})

export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60_000,
  maxRequests: 10,
  keyPrefix: 'auth'
})

export const adminRateLimit = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 100,
  keyPrefix: 'admin'
})