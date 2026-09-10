import { describe, it, expect, vi, beforeEach } from 'vitest'
import { H3Event } from 'h3'

const readBodyMock = vi.fn()
vi.stubGlobal('defineEventHandler', (fn: any) => fn)
vi.stubGlobal('readBody', readBodyMock)
vi.stubGlobal('createError', (error: { statusCode: number; statusMessage: string }) =>
  Object.assign(new Error(error.statusMessage), error)
)

// Mock the dependencies
vi.mock('../../../server/utils/access', () => ({
  requireAccess: vi.fn().mockResolvedValue({ email: 'admin@example.com' })
}))

vi.mock('../../../server/utils/emailVerification', () => ({
  verifyEmailForRequest: vi.fn().mockResolvedValue({
    email: 'test@superwagen.es',
    claims: { email: 'admin@example.com' },
    verificationResult: { isValid: true }
  })
}))

describe('server/api/requests.post', () => {
  let handler: any

  beforeEach(async () => {
    // Reset the mock implementations for each test
    readBodyMock.mockReset()
  })

  it('should throw 400 for invalid email', async () => {
    // Mock db utility
    const mockDb = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
        }),
      }),
    }

    // Mock event
    const mockEvent = {
      context: {
        cloudflare: {
          env: { DB: mockDb }
        }
      }
    } as unknown as H3Event

    // Set up the readBody mock
    readBodyMock.mockResolvedValue({ email: 'invalid', productId: 1, quantity: 1 })
    const { verifyEmailForRequest } = await import('../../../server/utils/emailVerification')
    vi.mocked(verifyEmailForRequest).mockRejectedValueOnce(new Error('Email verification failed'))
    
    // Import handler
    handler = (await import('../../../server/api/requests.post')).default

    await expect(handler(mockEvent)).rejects.toThrow('Email verification failed')
  })

  it('should throw 400 for missing product', async () => {
    // Mock db utility
    const mockDb = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
        }),
      }),
    }

    // Mock event
    const mockEvent = {
      context: {
        cloudflare: {
          env: { DB: mockDb }
        }
      }
    } as unknown as H3Event

    // Set up the readBody mock
    readBodyMock.mockResolvedValue({ email: 'test@superwagen.es', productId: 999, quantity: 1 })
    
    // Import handler
    handler = (await import('../../../server/api/requests.post')).default

    await expect(handler(mockEvent)).rejects.toThrow('Producto no encontrado')
  })
})
