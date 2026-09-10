import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRateLimiter } from '../../../server/utils/rateLimit'
import { H3Event } from 'h3'

// Mock getHeader as a global function since it's used directly in rateLimit.ts
vi.stubGlobal('getHeader', vi.fn().mockReturnValue('1.2.3.4'))

describe('server/utils/rateLimit', () => {
  let limiter: any
  let mockEvent: any

  beforeEach(() => {
    limiter = createRateLimiter({
      windowMs: 1000,
      maxRequests: 2,
      keyPrefix: 'test'
    })

    mockEvent = {
      path: '/api/test',
      context: {
        cloudflare: {
          env: {}
        }
      }
    } as unknown as H3Event
  })

  it('should allow requests within the limit', async () => {
    const res1 = await limiter(mockEvent)
    expect(res1.allowed).toBe(true)
    expect(res1.remaining).toBe(1)

    const res2 = await limiter(mockEvent)
    expect(res2.allowed).toBe(true)
    expect(res2.remaining).toBe(0)
  })

  it('should block requests exceeding the limit', async () => {
    await limiter(mockEvent)
    await limiter(mockEvent)
    
    const res3 = await limiter(mockEvent)
    expect(res3.allowed).toBe(false)
    expect(res3.remaining).toBe(0)
  })

  it('should allow requests again after the window expires', async () => {
    await limiter(mockEvent)
    await limiter(mockEvent)
    
    // Wait for window to expire
    await new Promise(resolve => setTimeout(resolve, 1100))
    
    const res = await limiter(mockEvent)
    expect(res.allowed).toBe(true)
    expect(res.remaining).toBe(1)
  })

  it('should track limits separately for different paths', async () => {
    const event1 = { ...mockEvent }
    const event2 = { ...mockEvent }
    
    event2.path = '/api/other'
    
    await limiter(event1)
    await limiter(event1)
    
    expect((await limiter(event1)).allowed).toBe(false)
    expect((await limiter(event2)).allowed).toBe(true)
  })
})
