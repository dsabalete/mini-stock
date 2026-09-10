import { describe, it, expect, vi, beforeEach } from 'vitest'
import { H3Event } from 'h3'

// Mock the global defineEventHandler that Nuxt provides
vi.stubGlobal('defineEventHandler', (fn: any) => fn)

describe('server/api/inventory.get', () => {
  let handler: any

  beforeEach(() => {
    // Clear module cache to ensure fresh imports
    vi.resetModules()
  })

  it('should return a list of products, requests and movements', async () => {
    // Mock the db utility
    const mockDb = {
      prepare: vi.fn().mockReturnValue({
        all: vi.fn().mockResolvedValue({ results: [] }),
      }),
    }

    // Mock event with db
    const mockEvent = {
      context: {
        cloudflare: {
          env: { DB: mockDb }
        }
      }
    } as unknown as H3Event

    // Import handler after setting up mocks
    handler = (await import('../../../server/api/inventory.get')).default

    const products = [{ id: 1, name: 'P1', sku: 'S1', ref: 'R1', line: 'L1', stock_sc: 10, stock_sbd: 5, incoming: 0, cost: 100, price: 200, accent: 'blue', locked: 0 }]
    const requests = [{ id: 1, product_id: 1, name: 'P1', sku: 'S1', email: 't@t.com', quantity: 1, status: 'pending', created_at: 'now' }]
    const movements = [{ id: 1, title: 'M1', detail: 'D1', amount: 10, type: 'in', created_at: 'now' }]

    mockDb.prepare.mockImplementation((query: string) => {
      if (query.includes('FROM products')) return { all: vi.fn().mockResolvedValue({ results: products }) }
      if (query.includes('FROM order_requests')) return { all: vi.fn().mockResolvedValue({ results: requests }) }
      if (query.includes('FROM movements')) return { all: vi.fn().mockResolvedValue({ results: movements }) }
      return { all: vi.fn().mockResolvedValue({ results: [] }) }
    })

    const result = await handler(mockEvent)

    expect(result.products).toHaveLength(1)
    expect(result.products[0].name).toBe('P1')
    expect(result.requests).toHaveLength(1)
    expect(result.recentMovements).toHaveLength(1)
  })
})
