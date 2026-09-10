import { getDb, productFromRow } from '../utils/db'
import { logAudit } from '../utils/audit'
import { requireAccess } from '../utils/access'

export default defineEventHandler(async (event) => {
  const claims = await requireAccess(event)
  const adminEmail = claims.email || 'unknown@superwagen.es'
  const body = await readBody<{ productId: number; type: 'in' | 'out'; quantity: number; location: 'SC' | 'SBD'; note?: string }>(event)
  if (!body?.productId || !['in', 'out'].includes(body.type) || !['SC', 'SBD'].includes(body.location) || !Number.isInteger(body.quantity) || body.quantity <= 0) throw createError({ statusCode: 400, statusMessage: 'Movimiento inválido' })
  const db = getDb(event)
  const column = body.location === 'SC' ? 'stock_sc' : 'stock_sbd'
  const row = await db.prepare('SELECT * FROM products WHERE id = ?').bind(body.productId).first<Record<string, unknown>>()
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Producto no encontrado' })
  const current = Number(row[column])
  const next = body.type === 'in' ? current + body.quantity : Math.max(0, current - body.quantity)
  const now = new Date().toISOString()
  await db.batch([
    db.prepare(`UPDATE products SET ${column} = ? WHERE id = ?`).bind(next, body.productId),
    db.prepare('INSERT INTO movements (title, detail, amount, type, created_at) VALUES (?, ?, ?, ?, ?)').bind(`${body.type === 'in' ? 'Entrada' : 'Despacho'} en ${body.location}`, body.note || row.name, body.quantity, body.type, now),
  ])
await logAudit(event, {
  action: `stock_movement_${body.type}`,
  entityType: 'product',
  entityId: body.productId,
  userEmail: adminEmail,
  userRole: 'admin',
  details: { 
    productId: body.productId, 
    productName: row.name, 
    quantity: body.quantity, 
    location: body.location, 
    note: body.note,
    movementType: body.type === 'in' ? 'entrada' : 'despacho'
  }
})
  return { product: productFromRow({ ...row, [column]: next }), movement: { title: `${body.type === 'in' ? 'Entrada' : 'Despacho'} en ${body.location}`, detail: body.note || row.name, amount: body.quantity, type: body.type, time: now } }
})
