import { requireAdmin } from '../utils/access'
import { logAudit } from '../utils/audit'
import { getDb, productFromRow } from '../utils/db'

type NewProduct = {
  line: string
  name: string
  sku: string
  ref: string
  stockSC: number
  stockSBD: number
  incoming: number
  cost: number
  price: number
  accent: 'red' | 'amber' | 'green'
}

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function nonNegativeInteger(value: unknown) {
  return Number.isInteger(value) && Number(value) >= 0
}

function nonNegativeNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

export default defineEventHandler(async (event) => {
  const claims = await requireAdmin(event)
  const body = (await readBody<Partial<NewProduct>>(event)) ?? {}
  const product: NewProduct = {
    line: text(body.line).toUpperCase(),
    name: text(body.name),
    sku: text(body.sku),
    ref: text(body.ref),
    stockSC: body.stockSC ?? 0,
    stockSBD: body.stockSBD ?? 0,
    incoming: body.incoming ?? 0,
    cost: body.cost ?? 0,
    price: body.price ?? 0,
    accent: body.accent ?? 'amber',
  }

  if (
    !product.line ||
    !product.name ||
    !product.sku ||
    !product.ref ||
    !['red', 'amber', 'green'].includes(product.accent) ||
    !nonNegativeInteger(product.stockSC) ||
    !nonNegativeInteger(product.stockSBD) ||
    !nonNegativeInteger(product.incoming) ||
    !nonNegativeNumber(product.cost) ||
    !nonNegativeNumber(product.price)
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Datos de producto inválidos',
    })

  const db = getDb(event)
  const result = await db
    .prepare(
      `INSERT INTO products
        (line, name, sku, ref, stock_sc, stock_sbd, incoming, cost, price, accent, locked)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`
    )
    .bind(
      product.line,
      product.name,
      product.sku,
      product.ref,
      product.stockSC,
      product.stockSBD,
      product.incoming,
      product.cost,
      product.price,
      product.accent
    )
    .run()

  const id = result.meta.last_row_id
  const row = await db
    .prepare('SELECT * FROM products WHERE id = ?')
    .bind(id)
    .first<Record<string, unknown>>()

  if (!row)
    throw createError({
      statusCode: 500,
      statusMessage: 'No se pudo recuperar el producto creado',
    })

  await logAudit(event, {
    action: 'product_created',
    entityType: 'product',
    entityId: Number(id),
    userEmail: claims.email || 'unknown@superwagen.es',
    userRole: 'admin',
    details: product,
  })

  return { product: productFromRow(row) }
})
