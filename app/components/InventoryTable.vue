<script setup lang="ts">
import type { Product } from '../composables/useInventory'
defineProps<{ products: Product[] }>()
const emit = defineEmits<{ movement: [product: Product] }>()
const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value)
</script>

<template>
  <div class="table-scroll"><table class="inventory-table"><thead><tr><th>Línea</th><th>Producto / descripción</th><th>SKU</th><th>Ref.</th><th class="numeric">Stock actual</th><th class="numeric">Por recibir</th><th class="numeric">Reservado</th><th class="numeric">P. coste</th><th class="numeric">PVP</th><th></th></tr></thead><tbody><tr v-for="product in products" :key="product.id"><td><span class="line-tag" :class="`line-tag--${product.accent}`">{{ product.line }}</span></td><td><div class="product-name">{{ product.name }}</div><span v-if="product.locked" class="table-lock">▣ solicitud bloqueada</span></td><td class="code-cell">{{ product.sku }}</td><td class="code-cell">{{ product.ref }}</td><td class="numeric"><span class="stock-value" :class="`stock-value--${product.accent}`"><i></i>{{ product.stock }}</span></td><td class="numeric"><span :class="{ 'incoming-value': product.incoming }">{{ product.incoming }}</span></td><td class="numeric muted-cell">{{ product.reserved }}</td><td class="numeric price-cell">{{ formatCurrency(product.cost) }}</td><td class="numeric price-cell price-cell--strong">{{ formatCurrency(product.price) }}</td><td><button class="row-action" :aria-label="`Registrar movimiento para ${product.name}`" @click="emit('movement', product)">↗</button></td></tr><tr v-if="products.length === 0"><td colspan="10" class="empty-state">No hay referencias que coincidan con tu búsqueda.</td></tr></tbody></table></div>
</template>
