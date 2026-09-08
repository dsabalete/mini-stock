import { computed, reactive, shallowRef } from 'vue'

export type Product = { id: number; line: string; name: string; sku: string; ref: string; stock: number; stockSC?: number; stockSBD?: number; incoming: number; reserved: number; cost: number; price: number; status: 'ok' | 'low' | 'critical'; accent: string; locked: boolean }
export type Movement = { id: number; title: string; detail: string; amount: number; type: 'in' | 'out'; time: string }
export type OrderRequest = { id: number; productId: number; productName: string; sku: string; email: string; quantity: number; status: 'pending' | 'approved' | 'rejected'; createdAt: string }

const initialProducts: Product[] = [
  { id: 1, line: 'DRIVER', name: 'Camiseta Authentic de piloto Hombre Talla L', sku: '31 3260294', ref: 'KE9091', stock: 2, incoming: 0, reserved: 0, cost: 57.60, price: 120, status: 'critical', accent: 'red', locked: false },
  { id: 2, line: 'DRIVER', name: 'Camiseta Authentic de piloto Hombre Talla XL', sku: '31 3260295', ref: 'KE9091', stock: 1, incoming: 3, reserved: 0, cost: 57.60, price: 120, status: 'low', accent: 'amber', locked: true },
  { id: 3, line: 'DRIVER', name: 'Camiseta Authentic de piloto Hombre Talla 2XL', sku: '31 3260296', ref: 'KE9091', stock: 1, incoming: 0, reserved: 0, cost: 57.60, price: 120, status: 'critical', accent: 'red', locked: false },
  { id: 4, line: 'APPAREL', name: 'Polo de manga corta de ingeniero Hombre Talla L', sku: '31 3262504', ref: 'KE7324', stock: 2, incoming: 2, reserved: 0, cost: 48.00, price: 100, status: 'low', accent: 'amber', locked: false },
  { id: 5, line: 'APPAREL', name: 'Polo de manga corta de ingeniero Hombre Talla XL', sku: '31 3262505', ref: 'KE7324', stock: 2, incoming: 0, reserved: 0, cost: 48.00, price: 100, status: 'low', accent: 'amber', locked: false },
  { id: 6, line: 'APPAREL', name: 'Chaqueta tipo chándal de ingeniero Mujer Talla L', sku: '31 3262706', ref: 'KE9104', stock: 2, incoming: 0, reserved: 0, cost: 57.60, price: 120, status: 'low', accent: 'amber', locked: false },
  { id: 7, line: 'APPAREL', name: 'Chaqueta tipo chándal de ingeniero Hombre Talla L', sku: '31 3262706', ref: 'KE9104', stock: 4, incoming: 0, reserved: 0, cost: 57.60, price: 120, status: 'ok', accent: 'green', locked: false },
  { id: 8, line: 'ACCESSORIES', name: 'Gorra de team con logo Audi en frontal', sku: '31 3263003', ref: 'KE9081', stock: 1, incoming: 0, reserved: 0, cost: 16.80, price: 35, status: 'critical', accent: 'red', locked: false },
  { id: 9, line: 'ACCESSORIES', name: 'Sudadera de triple capucha Hombre Talla L', sku: '31 3267044', ref: 'KE6787', stock: 2, incoming: 0, reserved: 0, cost: 33.60, price: 70, status: 'low', accent: 'amber', locked: false },
  { id: 10, line: 'ACCESSORIES', name: 'Sudadera de triple capucha Hombre Talla XL', sku: '31 3267045', ref: 'KE6787', stock: 2, incoming: 0, reserved: 0, cost: 33.60, price: 70, status: 'low', accent: 'amber', locked: false },
  { id: 11, line: 'FAN RANGE', name: 'Chaqueta de chándal Hombre Talla XL', sku: '31 3261405', ref: 'KE6784', stock: 2, incoming: 0, reserved: 0, cost: 33.60, price: 70, status: 'low', accent: 'amber', locked: false },
  { id: 12, line: 'FAN RANGE', name: 'Chaqueta de chándal Hombre Talla 2XL', sku: '31 3261406', ref: 'KE6784', stock: 2, incoming: 0, reserved: 0, cost: 26.40, price: 55, status: 'low', accent: 'amber', locked: false },
]

export function useInventory() {
  const products = reactive<Product[]>(initialProducts.map((p) => ({ ...p, stockSC: Math.ceil(p.stock / 2), stockSBD: Math.floor(p.stock / 2) })))
  const search = shallowRef('')
  const activeFilter = shallowRef<'all' | 'available' | 'low'>('all')
  const movementOpen = shallowRef(false)
  const selectedProduct = shallowRef<Product | null>(null)
  const requests = reactive<OrderRequest[]>([
    { id: 101, productId: 2, productName: initialProducts[1].name, sku: initialProducts[1].sku, email: 'marina.garcia@audi.com', quantity: 1, status: 'pending', createdAt: 'Hoy, 10:14' },
  ])
  const recentMovements = reactive<Movement[]>([
    { id: 1, title: 'Entrada de mercancía', detail: 'Pedido AD-2026-041 · 3 referencias', amount: 12, type: 'in', time: 'Hoy, 09:42' },
    { id: 2, title: 'Despacho a hospitality', detail: 'GP Barcelona · Zona Paddock', amount: 8, type: 'out', time: 'Ayer, 17:18' },
    { id: 3, title: 'Reserva actualizada', detail: 'Kit piloto · Evento Mónaco', amount: 4, type: 'out', time: 'Ayer, 12:06' },
  ])
  const filteredProducts = computed(() => products.filter((product) => {
    const query = search.value.toLowerCase()
    const matchesSearch = !query || `${product.name} ${product.sku} ${product.ref} ${product.line}`.toLowerCase().includes(query)
    const matchesFilter = activeFilter.value === 'all' || (activeFilter.value === 'available' ? totalStock(product) > 0 : product.status !== 'ok')
    return matchesSearch && matchesFilter
  }))
  const metrics = computed(() => ({
    totalStock: products.reduce((sum, p) => sum + totalStock(p), 0),
    inventoryValue: formatCurrency(products.reduce((sum, p) => sum + totalStock(p) * p.cost, 0)),
    incoming: products.reduce((sum, p) => sum + p.incoming, 0),
    alerts: products.filter((p) => p.status !== 'ok').length,
    pendingRequests: requests.filter((request) => request.status === 'pending').length,
    lockedItems: products.filter((product) => product.locked).length,
    coverage: [
      { name: 'Driver', value: 38, color: '#e43b3b' },
      { name: 'Apparel', value: 72, color: '#c6a76d' },
      { name: 'Accessories', value: 56, color: '#c6a76d' },
      { name: 'Fan range', value: 84, color: '#7ecb8e' },
    ],
  }))
  function setFilter(filter: 'all' | 'available' | 'low') { activeFilter.value = filter }
  function openMovement(product?: Product) { selectedProduct.value = product ?? null; movementOpen.value = true }
  function closeMovement() { movementOpen.value = false }
  function recordMovement(payload: { productId: number; type: 'in' | 'out'; quantity: number; location: 'SC' | 'SBD'; note: string }) {
    const product = products.find((item) => item.id === payload.productId)
    if (!product) return
    const current = payload.location === 'SC' ? (product.stockSC ?? 0) : (product.stockSBD ?? 0)
    const updated = payload.type === 'in' ? current + payload.quantity : Math.max(0, current - payload.quantity)
    if (payload.location === 'SC') product.stockSC = updated
    else product.stockSBD = updated
    syncStock(product)
    recentMovements.unshift({ id: Date.now(), title: payload.type === 'in' ? `Entrada en ${payload.location}` : `Despacho desde ${payload.location}`, detail: payload.note || product.name, amount: payload.quantity, type: payload.type, time: 'Ahora' })
    movementOpen.value = false
  }
  function submitRequest(email: string, productId: number, quantity: number) {
    const product = products.find((item) => item.id === productId)
    if (!product || product.locked || totalStock(product) < quantity) return false
    product.locked = true
    requests.unshift({ id: Date.now(), productId, productName: product.name, sku: product.sku, email, quantity, status: 'pending', createdAt: 'Ahora' })
    recentMovements.unshift({ id: Date.now(), title: 'Solicitud de usuario', detail: `${email} · ${product.name}`, amount: quantity, type: 'out', time: 'Ahora' })
    return true
  }
  function manageRequest(requestId: number, decision: 'approved' | 'rejected') {
    const request = requests.find((item) => item.id === requestId)
    const product = request && products.find((item) => item.id === request.productId)
    if (!request || !product || request.status !== 'pending') return
    request.status = decision
    product.locked = false
    if (decision === 'approved') {
      takeFromLocations(product, request.quantity)
      recentMovements.unshift({ id: Date.now(), title: 'Pedido aprobado', detail: `${request.email} · ${product.name}`, amount: request.quantity, type: 'out', time: 'Ahora' })
    } else {
      recentMovements.unshift({ id: Date.now(), title: 'Solicitud rechazada', detail: `${request.email} · ${product.name}`, amount: request.quantity, type: 'in', time: 'Ahora' })
    }
  }
  return { activeFilter, filteredProducts, search, setFilter, selectedProduct, openMovement, closeMovement, recordMovement, metrics, recentMovements, movementOpen, requests, submitRequest, manageRequest }
}

function formatCurrency(value: number) { return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value) }
function totalStock(product: Product) { return (product.stockSC ?? product.stock) + (product.stockSBD ?? 0) }
function syncStock(product: Product) {
  product.stock = totalStock(product)
  product.status = product.stock <= 1 ? 'critical' : product.stock <= 2 ? 'low' : 'ok'
}
function takeFromLocations(product: Product, quantity: number) {
  const fromSC = Math.min(product.stockSC ?? 0, quantity)
  product.stockSC = (product.stockSC ?? 0) - fromSC
  product.stockSBD = Math.max(0, (product.stockSBD ?? 0) - (quantity - fromSC))
  syncStock(product)
}
