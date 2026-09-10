import { describe, it, expect, vi } from 'vitest'
import { productFromRow, getDb } from '@/server/utils/db'
import { H3Event } from 'h3'

describe('server/utils/db', () => {
  describe('productFromRow', () => {
    it('should correctly map a database row to a product object', () => {
      const row = {
        id: '1',
        line: 'Line A',
        name: 'Product 1',
        sku: 'SKU1',
        ref: 'REF1',
        stock_sc: '10',
        stock_sbd: '5',
        incoming: '2',
        cost: '100',
        price: '200',
        accent: 'blue',
        locked: 0,
      }
      const product = productFromRow(row)
      expect(product).toEqual({
        id: 1,
        line: 'Line A',
        name: 'Product 1',
        sku: 'SKU1',
        ref: 'REF1',
        stock: 15,
        stockSC: 10,
        stockSBD: 5,
        incoming: 2,
        reserved: 0,
        cost: 100,
        price: 200,
        status: 'ok',
        accent: 'blue',
        locked: false,
      })
    })

    it('should set status to critical for stock <= 1', () => {
      const row = { stock_sc: '1', stock_sbd: '0' } as any
      expect(productFromRow(row).status).toBe('critical')
    })

    it('should set status to low for stock <= 2', () => {
      const row = { stock_sc: '2', stock_sbd: '0' } as any
      expect(productFromRow(row).status).toBe('low')
    })

    it('should set status to ok for stock > 2', () => {
      const row = { stock_sc: '3', stock_sbd: '0' } as any
      expect(productFromRow(row).status).toBe('ok')
    })
  })

  describe('getDb', () => {
    it('should return DB from context if available', () => {
      const mockDb = { prepare: vi.fn() }
      const event = {
        context: {
          cloudflare: {
            env: { DB: mockDb },
          },
        },
      } as unknown as H3Event

      expect(getDb(event)).toBe(mockDb)
    })

    it('should throw 503 error if DB is missing', () => {
      const event = {
        context: {
          cloudflare: {
            env: {},
          },
        },
      } as unknown as H3Event

      expect(() => getDb(event)).toThrow(/Base de datos no disponible/)
    })
  })
})
