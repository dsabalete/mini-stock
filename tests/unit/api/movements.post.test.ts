import { describe, it, expect, vi, beforeEach } from 'vitest'
import { H3Event } from 'h3'

// Mock the global defineEventHandler that Nuxt provides
vi.stubGlobal('defineEventHandler', (fn: any) => fn)
vi.stubGlobal('readBody', vi.fn())
vi.stubGlobal('createError', (error: { statusCode: number; statusMessage: string }) =>
  Object.assign(new Error(error.statusMessage), error)
)

// Mock h3 utilities and access before any imports
vi.mock('h3', async () => {
  const actual = await vi.importActual('h3')
  return {
    ...actual,
    defineEventHandler: (fn: any) => fn,
    readBody: vi.fn(),
  }
})

vi.mock('../../../server/utils/access', () => ({
  requireAccess: vi.fn().mockResolvedValue({ email: 'admin@example.com' })
}))

describe('server/api/movements.post', () => {
  let handler: any

  beforeEach(() => {
    // Clear module cache to get fresh imports with mocks
    vi.resetModules()
  })

  it('should throw 400 for invalid input', async () => {
    // Mock the db utility
    const mockDb = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue({ id: 1, name: 'Product 1', stock_sc: 10, stock_sbd: 5 }),
          run: vi.fn().mockResolvedValue({}),
        }),
      }),
      batch: vi.fn().mockResolvedValue({}),
    }

    // Mock event with db
    const mockEvent = {
      context: {
        cloudflare: {
          env: { DB: mockDb }
        }
      }
    } as unknown as H3Event

    // Mock readBody
    ;(globalThis as any).readBody.mockResolvedValue({ productId: 1, type: 'invalid', quantity: 1, location: 'SC' })
    
    // Import handler after setting up mocks
    handler = (await import('../../../server/api/movements.post')).default

    await expect(handler(mockEvent)).rejects.toThrow('Movimiento inválido')
  })

  it('should successfully record a movement', async () => {
    // Mock the db utility
    const mockDb = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue({ id: 1, name: 'Product 1', stock_sc: 10, stock_sbd: 5 }),
          run: vi.fn().mockResolvedValue({}),
        }),
      }),
      batch: vi.fn().mockResolvedValue({}),
    }

    // Mock event with db
    const mockEvent = {
      context: {
        cloudflare: {
          env: { DB: mockDb }
        }
      }
    } as unknown as H3Event

    // Mock readBody
    ;(globalThis as any).readBody.mockResolvedValue({ 
      productId: 1, 
      type: 'in', 
      quantity: 5, 
      location: 'SC', 
      note: 'Test' 
    })
    
    // Import handler after setting up mocks
    handler = (await import('../../../server/api/movements.post')).default

    const result = await handler(mockEvent)
    expect(result).toHaveProperty('product')
    expect(result).toHaveProperty('movement')
  })
})
