
import { getDb } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string; productId: number; quantity: number }>(event)
  if (!body?.email || !/^[^\s@]+@superwagen\.es$/i.test(body.email) || !Number.isInteger(body.quantity) || body.quantity <= 0) throw createError({ statusCode: 400, statusMessage: 'Solicitud inválida' })
  const db = getDb(event)
  const product = await db.prepare('SELECT * FROM products WHERE id = ?').bind(body.productId).first<Record<string, unknown>>()
  if (!product) throw createError({ statusCode: 404, statusMessage: 'Producto no encontrado' })
  if (Boolean(product.locked) || Number(product.stock_sc) + Number(product.stock_sbd) < body.quantity) throw createError({ statusCode: 409, statusMessage: 'Producto no disponible' })
  const id = Date.now()
  const now = new Date().toISOString()
  await db.transaction(async (tx) => {
    await tx.batch([
      db.prepare('UPDATE products SET locked = 1 WHERE id = ?').bind(body.productId),
      db.prepare('INSERT INTO order_requests (id, product_id, email, quantity, status, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(id, body.productId, body.email.trim().toLowerCase(), body.quantity, 'pending', now),
      db.prepare('INSERT INTO movements (title, detail, amount, type, created_at) VALUES (?, ?, ?, ?, ?)').bind('Solicitud de usuario', `${body.email} · ${product.name}`, body.quantity, 'out', now),
    ]);
  });
  return { id }
})
