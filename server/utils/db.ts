import type { H3Event } from 'h3'

export function getDb(event: H3Event): D1Database {
  const db = (event.context.cloudflare?.env as { DB?: D1Database } | undefined)?.DB
  if (!db) throw createError({ statusCode: 503, statusMessage: 'D1 no está configurada. Ejecuta la aplicación con Wrangler.' })
  return db
}

export function productFromRow(row: Record<string, unknown>) {
  const stockSC = Number(row.stock_sc)
  const stockSBD = Number(row.stock_sbd)
  const stock = stockSC + stockSBD
  return { id: Number(row.id), line: row.line, name: row.name, sku: row.sku, ref: row.ref, stock, stockSC, stockSBD, incoming: Number(row.incoming), reserved: 0, cost: Number(row.cost), price: Number(row.price), status: stock <= 1 ? 'critical' : stock <= 2 ? 'low' : 'ok', accent: row.accent, locked: Boolean(row.locked) }
}
