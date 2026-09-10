import { beforeEach, describe, expect, it, vi } from 'vitest'
import { logAudit } from '../../../server/utils/audit'
import { H3Event } from 'h3'

vi.mock('h3', async () => {
  const actual = await vi.importActual('h3')
  return {
    ...actual,
    getHeader: vi.fn(),
  }
})

describe('server/utils/audit', () => {
  let mockDb: any
  let mockEvent: H3Event
  let statement: any

  beforeEach(() => {
    statement = {
      bind: vi.fn().mockReturnThis(),
      run: vi.fn().mockResolvedValue({}),
    }
    mockDb = {
      prepare: vi.fn().mockReturnValue(statement),
    }
    mockEvent = {
      context: {
        cloudflare: {
          env: { DB: mockDb },
        },
      },
    } as unknown as H3Event
  })

  it('should write an audit log entry to the database', async () => {
    const { getHeader } = await import('h3')
    ;(getHeader as any).mockReturnValue('1.2.3.4')

    const entry = {
      action: 'test_action',
      entityType: 'product' as const,
      entityId: 123,
      userEmail: 'user@example.com',
      userRole: 'admin' as const,
      details: { key: 'value' },
    }

    await logAudit(mockEvent, entry)

    expect(mockDb.prepare).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO audit_log')
    )
    const bindArgs = statement.bind.mock.calls[0]
    expect(bindArgs).toContain('test_action')
    expect(bindArgs).toContain('product')
    expect(bindArgs).toContain(123)
    expect(bindArgs).toContain('user@example.com')
    expect(bindArgs).toContain('admin')
    expect(bindArgs).toContain(JSON.stringify(entry.details))
    expect(bindArgs).toContain('1.2.3.4')
  })

  it('should not throw when database write fails', async () => {
    statement.run.mockRejectedValue(new Error('DB Error'))

    const entry = {
      action: 'test_action',
      entityType: 'product' as const,
      entityId: 123,
      userEmail: 'user@example.com',
      userRole: 'admin' as const,
      details: {},
    }

    await expect(logAudit(mockEvent, entry)).resolves.toBeUndefined()
  })
})
