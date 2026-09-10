import { describe, it, expect, vi } from 'vitest'
import { verifyEmailComprehensive } from '@/server/utils/emailVerification'
import dns from 'dns/promises'

vi.mock('dns/promises')

describe('server/utils/emailVerification', () => {
  it('should return invalid for malformed email syntax', async () => {
    const result = await verifyEmailComprehensive('invalid-email')
    expect(result.isValid).toBe(false)
    expect(result.hasValidSyntax).toBe(false)
    expect(result.errors).toContain('Invalid email format')
  })

  it('should return invalid if domain does not exist', async () => {
    ;(dns.resolveMx as any)
      .mockRejectedValue(new Error('DNS Error'))(dns.resolve4 as any)
      .mockRejectedValue(new Error('DNS Error'))

    const result = await verifyEmailComprehensive('test@nonexistentdomain.com')
    expect(result.isValid).toBe(false)
    expect(result.domainExists).toBe(false)
    expect(result.errors).toContain(
      'Domain does not exist or has no DNS records'
    )
  })

  it('should return invalid if SPF record is missing', async () => {
    ;(dns.resolveMx as any)
      .mockResolvedValue([{ exchange: 'mx1.test.com', priority: 10 }])(
        dns.resolveTxt as any
      )
      .mockImplementation((domain: string) => {
        if (domain === 'test.com') return Promise.resolve(['v=txt-not-spf'])
        return Promise.resolve([])
      })

    const result = await verifyEmailComprehensive('test@test.com')
    expect(result.spfValid).toBe(false)
    expect(result.errors).toContain('No valid SPF record found')
  })

  it('should return valid when all checks pass', async () => {
    ;(dns.resolveMx as any)
      .mockResolvedValue([{ exchange: 'mx1.test.com', priority: 10 }])(
        dns.resolveTxt as any
      )
      .mockImplementation((domain: string) => {
        if (domain === 'test.com') return Promise.resolve(['v=spf1 a mx'])
        if (domain === '_dmarc.test.com')
          return Promise.resolve(['v=DMARC1; p=reject'])
        return Promise.resolve([])
      })

    const result = await verifyEmailComprehensive('test@test.com')
    expect(result.isValid).toBe(true)
    expect(result.hasValidSyntax).toBe(true)
    expect(result.domainExists).toBe(true)
    expect(result.spfValid).toBe(true)
    expect(result.dmarcValid).toBe(true)
  })
})
