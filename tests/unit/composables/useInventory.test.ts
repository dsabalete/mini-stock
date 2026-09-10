import { describe, it, expect, vi, beforeEach } from 'vitest'

let useInventory: any
let $fetchMock: ReturnType<typeof vi.fn>

beforeEach(async () => {
  vi.resetModules()
  $fetchMock = vi.fn()
  vi.stubGlobal('$fetch', $fetchMock)
  const imported = await import('../../../app/composables/useInventory')
  useInventory = imported.useInventory
})

const mockProducts = [
  {
    id: 1,
    line: 'Line A',
    name: 'Product 1',
    sku: 'SKU1',
    ref: 'REF1',
    stock: 10,
    stockSC: 10,
    stockSBD: 0,
    incoming: 0,
    reserved: 0,
    cost: 100,
    price: 200,
    status: 'ok',
    accent: 'blue',
    locked: false,
  },
  {
    id: 2,
    line: 'Line B',
    name: 'Product 2',
    sku: 'SKU2',
    ref: 'REF2',
    stock: 2,
    stockSC: 2,
    stockSBD: 0,
    incoming: 5,
    reserved: 0,
    cost: 50,
    price: 100,
    status: 'low',
    accent: 'yellow',
    locked: false,
  },
]

const mockRequests = [
  {
    id: 1,
    productId: 1,
    productName: 'Product 1',
    sku: 'SKU1',
    email: 'test@example.com',
    quantity: 1,
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
]

const mockMovements = [
  {
    id: 1,
    title: 'Initial Stock',
    detail: 'Product 1',
    amount: 10,
    type: 'in',
    time: new Date().toISOString(),
  },
]

it('should load inventory data', async () => {
  $fetchMock.mockResolvedValue({
    products: mockProducts,
    requests: mockRequests,
    recentMovements: mockMovements,
  })

  const { load, products, requests, recentMovements, loading } = useInventory()
  
  expect(loading.value).toBe(true)
  await load()
  expect(loading.value).toBe(false)
  expect(products).toEqual(mockProducts)
  expect(requests).toEqual(mockRequests)
  expect(recentMovements).toEqual(mockMovements)
})

it('should filter products by search query', async () => {
  $fetchMock.mockResolvedValue({
    products: mockProducts,
    requests: [],
    recentMovements: [],
  })
  const { load, search, filteredProducts } = useInventory()
  await load()

  search.value = 'Product 1'
  expect(filteredProducts.value).toHaveLength(1)
  expect(filteredProducts.value[0].name).toBe('Product 1')

  search.value = 'SKU2'
  expect(filteredProducts.value).toHaveLength(1)
  expect(filteredProducts.value[0].name).toBe('Product 2')

  search.value = 'NonExistent'
  expect(filteredProducts.value).toHaveLength(0)
})

it('should filter products by status (available/low)', async () => {
  $fetchMock.mockResolvedValue({
    products: mockProducts,
    requests: [],
    recentMovements: [],
  })
  const { load, setFilter, filteredProducts } = useInventory()
  await load()

  setFilter('available')
  expect(filteredProducts.value).toHaveLength(2)

  setFilter('low')
  expect(filteredProducts.value).toHaveLength(1)
  expect(filteredProducts.value[0].status).toBe('low')
})

it('should calculate metrics correctly', async () => {
  $fetchMock.mockResolvedValue({
    products: mockProducts,
    requests: mockRequests,
    recentMovements: [],
  })
  const { load, metrics } = useInventory()
  await load()

  expect(metrics.value.totalStock).toBe(12)
  expect(metrics.value.incoming).toBe(5)
  expect(metrics.value.alerts).toBe(1)
  expect(metrics.value.pendingRequests).toBe(1)
})

it('should record a movement and update products list', async () => {
  $fetchMock.mockResolvedValueOnce({
    products: mockProducts,
    requests: [],
    recentMovements: [],
  })

  const { load, recordMovement, products, recentMovements } = useInventory()
  await load()

  const updatedProduct = { ...mockProducts[0], stock: 15, stockSC: 15 }
  const movement = { id: 100, title: 'Add stock', detail: 'Product 1', amount: 5, type: 'in', time: 'now' }
  
  $fetchMock.mockResolvedValueOnce({
    product: updatedProduct,
    movement: movement,
  })

  await recordMovement({
    productId: 1,
    type: 'in',
    quantity: 5,
    location: 'SC',
    note: 'Restock',
  })

  expect(products[0].stock).toBe(15)
  expect(recentMovements[0].amount).toBe(5)
})
