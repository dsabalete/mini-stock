import { getDb, productFromRow } from '../../utils/db'
import { logAudit } from '../../utils/audit'
import { requireAccess } from '../../utils/access'

export default defineEventHandler(async (event) => {
  const claims = await requireAccess(event)
  const adminEmail = claims.email || 'unknown@superwagen.es'
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ decision: 'approved' | 'rejected' }>(event)
  if (!id || !['approved', 'rejected'].includes(body?.decision)) throw createError({ statusCode: 400, statusMessage: 'Decisión inválida' })
  const db = getDb(event)
  const request = await db.prepare(`SELECT r.*, p.name, p.stock_sc, p.stock_sbd, p.locked FROM order_requests r JOIN products p ON p.id = r.product_id WHERE r.id = ?`).bind(id).first<Record<string, unknown>>()
  if (!request || request.status !== 'pending') throw createError({ statusCode: 404, statusMessage: 'Solicitud no encontrada o ya gestionada' })
  let sc = Number(request.stock_sc); let sbd = Number(request.stock_sbd)
  if (body.decision === 'approved') { const fromSC = Math.min(sc, Number(request.quantity)); sc -= fromSC; sbd = Math.max(0, sbd - (Number(request.quantity) - fromSC)) }
  const now = new Date().toISOString(); const type = body.decision === 'approved' ? 'out' : 'in'
  const movementTitle = body.decision === 'approved' ? 'Pedido aprobado' : 'Solicitud rechazada'
  await db.batch([
    db.prepare('UPDATE order_requests SET status = ? WHERE id = ?').bind(body.decision, id),
    db.prepare('UPDATE products SET stock_sc = ?, stock_sbd = ?, locked = 0 WHERE id = ?').bind(sc, sbd, request.product_id),
    db.prepare('INSERT INTO movements (title, detail, amount, type, created_at) VALUES (?, ?, ?, ?, ?)').bind(movementTitle, `${request.email} · ${request.name}`, request.quantity, type, now),
  ])
await logAudit(event, {
  action: `request_${body.decision}`,
  entityType: 'request',
  entityId: id,
  userEmail: adminEmail,
  userRole: 'admin',
  details: { 
    productId: request.product_id, 
    productName: request.name, 
    quantity: request.quantity, 
    requesterEmail: request.email,
    decision: body.decision
  }
})
  return { product: productFromRow({ ...request, stock_sc: sc, stock_sbd: sbd }), movement: { title: movementTitle, detail: `${request.email} · ${request.name}`, amount: Number(request.quantity), type, time: now } }
})
