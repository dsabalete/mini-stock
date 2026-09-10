import { describe, it, expect, vi, beforeEach } from 'vitest'
import { requireAccess, clearAccessTokenCache } from '../../../server/utils/access'
import { H3Event } from 'h3'

vi.mock('h3', async () => {
  const actual = await vi.importActual('h3')
  return {
    ...actual,
    getHeader: vi.fn(),
  }
})

describe('server/utils/access', () => {
  let mockEvent: any

  beforeEach(() => {
    clearAccessTokenCache()
    mockEvent = {
      context: {
        cloudflare: {
          env: {
            ACCESS_TEAM_DOMAIN: 'https://test.cloudflareaccess.com',
            ACCESS_AUD: 'test-app',
          }
        }
      }
    } as unknown as H3Event
  })

  it('should allow access if ACCESS_ALLOW_INSECURE_LOCAL is true', async () => {
    mockEvent.context.cloudflare.env.ACCESS_ALLOW_INSECURE_LOCAL = 'true'
    const claims = await requireAccess(mockEvent)
    expect(claims.email).toBe('dev@local')
  })

  it('should throw 503 if domain or aud is missing', async () => {
    delete mockEvent.context.cloudflare.env.ACCESS_TEAM_DOMAIN
    await expect(requireAccess(mockEvent)).rejects.toThrow(/Cloudflare Access no está configurado/)
  })

  it('should throw 401 401 if token is missing', async () => {
    const { getHeader } = await import('h3')
    ;(getHeader as any).mockReturnValue(undefined)
    await expect(requireAccess(mockEvent)).rejects.toThrow(/Falta la autenticación de Cloudflare Access/)
  })

  it('should throw 401 if token is malformed', async () => {
    const { getHeader } = await import('h3')
    ;(getHeader as any).mockReturnValue('invalid-token')
    await expect(requireAccess(mockEvent)).rejects.toThrow(/Token de Cloudflare Access inválido/)
  })

  it('should throw 401 if token claims are invalid (e.g. expired)', async () => {
    const { getHeader } = await import('h3')
    
    const payload = {
      iss: 'https://test.cloudflareaccess.com',
      aud: 'test-app',
      exp: Math.floor(Date.now() / 1000) - 100, // Expired
    }
    const encodedPayload = btoa(JSON.stringify(payload))
    const token = `header.${encodedPayload}.signature`
    
    ;(getHeader as any).mockReturnValue(token)
    await expect(requireAccess(mockEvent)).rejects.toThrow(/Token de Cloudflare Access inválido o caducado/)
  })
})
