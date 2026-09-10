import { getHeader, H3Event } from 'h3'
import { getDb } from './db'

export interface AuditLogEntry {
  action: string
  entityType: 'product' | 'request' | 'movement'
  entityId: number | string
  userEmail: string
  userRole: 'user' | 'admin'
  details: Record<string, unknown>
  timestamp: string
  ipAddress?: string
}

export async function logAudit(
  event: H3Event,
  entry: Omit<AuditLogEntry, 'timestamp' | 'ipAddress'>
) {
  try {
    const db = getDb(event)
    const ip = getClientIP(event)
    await db
      .prepare(
        `INSERT INTO audit_log (action, entity_type, entity_id, user_email, user_role, details, ip_address, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        entry.action,
        entry.entityType,
        entry.entityId,
        entry.userEmail,
        entry.userRole,
        JSON.stringify(entry.details),
        ip,
        new Date().toISOString()
      )
      .run()
  } catch {
    console.error('Failed to write audit log', entry)
  }
}

function getClientIP(event: H3Event): string {
  const forwarded = getHeader(event, 'cf-connecting-ip')
  if (forwarded) return forwarded
  const xff = getHeader(event, 'x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return getHeader(event, 'x-real-ip') || 'unknown'
}
