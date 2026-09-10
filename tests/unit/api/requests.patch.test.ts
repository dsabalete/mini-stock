import { describe, it, expect, vi, beforeEach } from 'vitest'
import { H3Event } from 'h3'

const readBodyMock = vi.fn()
const getRouterParamMock = vi.fn()
vi.stubGlobal('defineEventHandler', (fn: any) => fn)
vi.stubGlobal('readBody', readBodyMock)
vi.stubGlobal('getRouterParam', getRouterParamMock)
vi.stubGlobal('createError', (error: { statusCode: number; statusMessage: string }) =>
  Object.assign(new Error(error.statusMessage), error)
)

// Mock the h3 module globally to provide defineEventHandler
vi.mock('h3', () => ({
  defineEventHandler: (fn: any) => fn,
  readBody: vi.fn(),
  getRouterParam: vi.fn(),
}))

// Mock the dependencies
vi.mock('../../../server/utils/access', () => ({
  requireAccess: vi.fn().mockResolvedValue({ email: 'admin@example.com' })
}))

vi.mock('../../../server/utils/audit', () => ({
  logAudit: vi.fn().mockResolvedValue(undefined)
}))

describe('server/api/requests/[id].patch', () => {
  let handler: any

  beforeEach(() => {
    vi.resetModules()
  })

  it('should throw 400 for invalid decision', async () => {
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

    // Import and set up the mocks after resetting modules
    getRouterParamMock.mockReturnValue('1')
    readBodyMock.mockResolvedValue({ decision: 'invalid' })
    
    // Import handler
    handler = (await import('../../../server/api/requests/[id].patch')).default

    await expect(handler(mockEvent)).rejects.toThrow('Decisión inválida')
  })

  it('should throw 404 for non-existent request', async () => {
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

    // Import and set up the mocks after resetting modules
    getRouterParamMock.mockReturnValue('999')
    readBodyMock.mockResolvedValue({ decision: 'approved' })
    
    // Import handler
    handler = (await import('../../../server/api/requests/[id].patch')).default

    await expect(handler(mockEvent)).rejects.toThrow('Solicitud no encontrada o ya gestionada')
  })
})
