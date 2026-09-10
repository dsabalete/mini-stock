import { computed, reactive, shallowRef } from 'vue'
import type { NewProductPayload } from '../components/ProductForm.vue'

export type Product = {
  id: number
  line: string
  name: string
  sku: string
  ref: string
  stock: number
  stockSC?: number
  stockSBD?: number
  incoming: number
  reserved: number
  cost: number
  price: number
  status: 'ok' | 'low' | 'critical'
  accent: string
  locked: boolean
}
export type Movement = {
  id: number
  title: string
  detail: string
  amount: number
  type: 'in' | 'out'
  time: string
}
export type OrderRequest = {
  id: number
  productId: number
  productName: string
  sku: string
  email: string
  quantity: number
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}
type InventoryResponse = {
  products: Product[]
  requests: OrderRequest[]
  recentMovements: Movement[]
}

export function useInventory() {
  const products = reactive<Product[]>([]),
    requests = reactive<OrderRequest[]>([]),
    recentMovements = reactive<Movement[]>([])
  const search = shallowRef(''),
    activeFilter = shallowRef<'all' | 'available' | 'low'>('all'),
    movementOpen = shallowRef(false),
    selectedProduct = shallowRef<Product | null>(null),
    loading = shallowRef(true)
  async function load() {
    loading.value = true
    const data = await $fetch<InventoryResponse>('/api/inventory')
    products.splice(0, products.length, ...data.products)
    requests.splice(0, requests.length, ...data.requests)
    recentMovements.splice(0, recentMovements.length, ...data.recentMovements)
    loading.value = false
  }
  const filteredProducts = computed(() =>
    products.filter((product) => {
      const query = search.value.toLowerCase()
      const matchesSearch =
        !query ||
        `${product.name} ${product.sku} ${product.ref} ${product.line}`
          .toLowerCase()
          .includes(query)
      const matchesFilter =
        activeFilter.value === 'all' ||
        (activeFilter.value === 'available'
          ? totalStock(product) > 0
          : product.status !== 'ok')
      return matchesSearch && matchesFilter
    })
  )
  const metrics = computed(() => ({
    totalStock: products.reduce((sum, p) => sum + totalStock(p), 0),
    inventoryValue: formatCurrency(
      products.reduce((sum, p) => sum + totalStock(p) * p.cost, 0)
    ),
    incoming: products.reduce((sum, p) => sum + p.incoming, 0),
    alerts: products.filter((p) => p.status !== 'ok').length,
    pendingRequests: requests.filter((request) => request.status === 'pending')
      .length,
    lockedItems: products.filter((product) => product.locked).length,
    coverage: [
      { name: 'Driver', value: 38, color: '#e43b3b' },
      { name: 'Apparel', value: 72, color: '#c6a76d' },
      { name: 'Accessories', value: 56, color: '#c6a76d' },
      { name: 'Fan range', value: 84, color: '#7ecb8e' },
    ],
  }))
  function setFilter(filter: 'all' | 'available' | 'low') {
    activeFilter.value = filter
  }
  function openMovement(product?: Product) {
    selectedProduct.value = product ?? null
    movementOpen.value = true
  }
  function closeMovement() {
    movementOpen.value = false
  }
  async function recordMovement(payload: {
    productId: number
    type: 'in' | 'out'
    quantity: number
    location: 'SC' | 'SBD'
    note: string
  }) {
    const result = await $fetch<{ product: Product; movement: Movement }>(
      '/api/movements',
      { method: 'POST', body: payload }
    )
    const index = products.findIndex((item) => item.id === payload.productId)
    if (index >= 0) products[index] = result.product
    recentMovements.unshift({ id: Date.now(), ...result.movement })
    movementOpen.value = false
  }
  async function createProduct(payload: NewProductPayload) {
    const result = await $fetch<{ product: Product }>('/api/products', {
      method: 'POST',
      body: payload,
    })
    products.push(result.product)
    return result.product
  }
  async function submitRequest(
    email: string,
    productId: number,
    quantity: number
  ) {
    await $fetch('/api/requests', {
      method: 'POST',
      body: { email, productId, quantity },
    })
    await load()
    return true
  }
  async function manageRequest(
    requestId: number,
    decision: 'approved' | 'rejected'
  ) {
    const result = await $fetch<{ product: Product; movement: Movement }>(
      `/api/requests/${requestId}`,
      { method: 'PATCH', body: { decision } }
    )
    const request = requests.find((item) => item.id === requestId)
    if (request) request.status = decision
    const index = products.findIndex((item) => item.id === result.product.id)
    if (index >= 0) products[index] = result.product
    recentMovements.unshift({ id: Date.now(), ...result.movement })
  }
  return {
    activeFilter,
    filteredProducts,
    products,
    search,
    setFilter,
    selectedProduct,
    openMovement,
    closeMovement,
    recordMovement,
    createProduct,
    metrics,
    recentMovements,
    movementOpen,
    requests,
    submitRequest,
    manageRequest,
    load,
    loading,
  }
}
function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}
function totalStock(product: Product) {
  return (product.stockSC ?? product.stock) + (product.stockSBD ?? 0)
}
