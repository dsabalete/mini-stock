import { getDb, productFromRow } from '../utils/db'

export default defineEventHandler(async (event) => {
  const db = getDb(event)
  const [products, requests, movements] = await Promise.all([
    db.prepare('SELECT * FROM products ORDER BY id').all(),
    db
      .prepare(
        `SELECT r.*, p.name AS product_name, p.sku FROM order_requests r JOIN products p ON p.id = r.product_id ORDER BY r.created_at DESC`
      )
      .all(),
    db
      .prepare('SELECT * FROM movements ORDER BY created_at DESC LIMIT 50')
      .all(),
  ])
  return {
    products: products.results.map((row) =>
      productFromRow(row as Record<string, unknown>)
    ),
    requests: requests.results.map((row: Record<string, unknown>) => ({
      id: Number(row.id),
      productId: Number(row.product_id),
      productName: row.product_name,
      sku: row.sku,
      email: row.email,
      quantity: Number(row.quantity),
      status: row.status,
      createdAt: row.created_at,
    })),
    recentMovements: movements.results.map((row: Record<string, unknown>) => ({
      id: Number(row.id),
      title: row.title,
      detail: row.detail,
      amount: Number(row.amount),
      type: row.type,
      time: row.created_at,
    })),
  }
})
