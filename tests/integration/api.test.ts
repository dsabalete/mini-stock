import { describe, expect, it } from 'vitest'

const baseUrl = () => process.env.INTEGRATION_BASE_URL as string

async function request<T>(
  path: string,
  init?: { method?: string; headers?: Record<string, string>; body?: string }
) {
  const response = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...init?.headers,
    },
  })
  const body = (await response.json()) as T | { statusMessage?: string }
  return { response, body }
}

describe('API endpoints with a local D1 database', () => {
  it('reads products, seeded requests, and movements from D1', async () => {
    const { response, body } = await request<{
      products: Array<{ id: number }>
      requests: Array<{ id: number; status: string }>
      recentMovements: Array<{ id: number }>
    }>('/api/inventory')

    expect(response.status).toBe(200)
    expect(body.products).toHaveLength(12)
    expect(body.products[0].id).toBe(1)
    expect(body.requests).toContainEqual(
      expect.objectContaining({ id: 101, status: 'pending' })
    )
    expect(body.recentMovements).toHaveLength(3)
  })

  it('validates request input before touching D1', async () => {
    const created = await request('/api/requests', {
      method: 'POST',
      body: JSON.stringify({
        email: '',
        productId: 1,
        quantity: 1,
      }),
    })

    expect(created.response.status, JSON.stringify(created.body)).toBe(400)
  })

  it('records a stock movement and updates the selected location', async () => {
    const moved = await request<{
      product: { stockSC: number; stockSBD: number }
      movement: { type: string; amount: number }
    }>('/api/movements', {
      method: 'POST',
      body: JSON.stringify({
        productId: 3,
        type: 'in',
        quantity: 2,
        location: 'SBD',
        note: 'Recepción de prueba',
      }),
    })

    expect(moved.response.status, JSON.stringify(moved.body)).toBe(200)
    expect(moved.body.product.stockSC).toBe(1)
    expect(moved.body.product.stockSBD).toBe(2)
    expect(moved.body.movement).toMatchObject({ type: 'in', amount: 2 })
  })

  it('approves a seeded request and atomically changes status, stock, and lock', async () => {
    const approved = await request<{
      product: { stockSC: number; stockSBD: number; locked: boolean }
      movement: { title: string; type: string }
    }>('/api/requests/101', {
      method: 'PATCH',
      body: JSON.stringify({ decision: 'approved' }),
    })

    expect(approved.response.status, JSON.stringify(approved.body)).toBe(200)
    expect(approved.body.product).toMatchObject({
      stockSC: 0,
      stockSBD: 0,
      locked: false,
    })
    expect(approved.body.movement).toMatchObject({
      title: 'Pedido aprobado',
      type: 'out',
    })

    const inventory = await request<{
      requests: Array<{ id: number; status: string }>
    }>('/api/inventory')
    expect(inventory.body.requests).toContainEqual(
      expect.objectContaining({ id: 101, status: 'approved' })
    )
  })

  it('rejects invalid movement input without changing D1', async () => {
    const before = await request<{ recentMovements: unknown[] }>(
      '/api/inventory'
    )
    const invalid = await request('/api/movements', {
      method: 'POST',
      body: JSON.stringify({
        productId: 3,
        type: 'in',
        quantity: 0,
        location: 'SBD',
      }),
    })
    const after = await request<{ recentMovements: unknown[] }>(
      '/api/inventory'
    )

    expect(invalid.response.status).toBe(400)
    expect(after.body.recentMovements).toHaveLength(
      before.body.recentMovements.length
    )
  })
})
