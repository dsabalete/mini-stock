<script setup lang="ts">
import { computed, reactive, shallowRef, watch } from 'vue';
import type { Product } from '../composables/useInventory';

const props = defineProps<{ products: Product[]; email: string }>();
const emit = defineEmits<{ request: [productId: number, quantity: number] }>();
const search = shallowRef('');
const selectedLine = shallowRef('ALL');
const quantity = reactive<Record<number, number>>({});
const zoomedProduct = shallowRef<Product | null>(null);
watch(
  () => props.products,
  products => {
    products.forEach(product => {
      if (quantity[product.id] === undefined) quantity[product.id] = 0;
    });
  },
  { immediate: true }
);
const visibleProducts = computed(() =>
  props.products.filter(product => {
    const query = search.value.toLowerCase();
    return (
      (!query ||
        `${product.name} ${product.sku} ${product.ref}`
          .toLowerCase()
          .includes(query)) &&
      (selectedLine.value === 'ALL' || product.line === selectedLine.value)
    );
  })
);
const lines = computed(() => [
  'ALL',
  ...new Set(props.products.map(product => product.line)),
]);
function getQuantity(productId: number) {
  return quantity[productId] ?? 0;
}
function request(product: Product) {
  emit('request', product.id, getQuantity(product.id));
}
</script>

<template>
  <section class="public-catalog">
    <div class="catalog-hero">
      <div>
        <p class="eyebrow">Adidas × Audi F1</p>
        <h1>Regalos para el equipo</h1>
        <p>
          Selecciona una referencia disponible. Tu solicitud quedará bloqueada
          hasta que Operations la gestione.
        </p>
      </div>
      <div class="request-protocol">
        <span class="protocol-line"></span><strong>PROTOCOLO DE PEDIDO</strong
        ><span>01 · Seleccionar</span><span>02 · Solicitar</span
        ><span>03 · Confirmar</span>
      </div>
    </div>
    <div class="catalog-toolbar">
      <label class="search-box"
        ><span>⌕</span
        ><input
          v-model="search"
          type="search"
          placeholder="Buscar por producto o referencia..."
      /></label>
      <div class="catalog-lines">
        <button
          v-for="line in lines"
          :key="line"
          :class="{ active: selectedLine === line }"
          @click="selectedLine = line"
        >
          {{ line === 'ALL' ? 'Todos' : line }}
        </button>
      </div>
    </div>
    <div class="catalog-grid">
      <article
        v-for="product in visibleProducts"
        :key="product.id"
        class="product-card"
        :class="{
          'product-card--locked': product.locked || product.stock === 0,
        }"
      >
        <div class="product-card-top">
          <span class="line-tag" :class="`line-tag--${product.accent}`">{{
            product.line
          }}</span
          ><span v-if="product.locked" class="locked-chip">▣ Bloqueado</span
          ><span v-else class="available-chip"
            ><i></i> {{ product.stock }} disponibles</span
          >
        </div>
        <button
          class="product-visual"
          :class="`product-visual--${product.accent}`"
          type="button"
          :aria-label="`Ampliar imagen de ${product.name}`"
          @click="zoomedProduct = product"
        >
          <img
            :src="`/assets/products/${product.ref}.jpg`"
            :alt="product.name"
            loading="lazy"
          /><span class="zoom-hint">⌕ Ampliar</span>
        </button>
        <h2>{{ product.name }}</h2>
        <div class="product-meta">
          <span>{{ product.sku }}</span
          ><span>{{ product.ref }}</span>
        </div>
        <div class="public-locations">
          <span
            >SC <b>{{ product.stockSC }}</b></span
          ><span
            >SBD <b>{{ product.stockSBD }}</b></span
          >
        </div>
        <div v-if="product.locked" class="locked-message">
          Solicitud pendiente de gestión por administrador.
        </div>
        <div v-else-if="product.stock > 0" class="product-action">
          <div class="quantity-input">
            <button
              @click="
                quantity[product.id] = Math.max(0, getQuantity(product.id) - 1)
              "
            >
              −</button
            ><input
              v-model.number="quantity[product.id]"
              type="number"
              min="0"
              :max="product.stock"
            /><button
              @click="
                quantity[product.id] = Math.min(
                  product.stock,
                  getQuantity(product.id) + 1
                )
              "
            >
              ＋
            </button>
          </div>
          <button
            class="primary-button"
            :disabled="getQuantity(product.id) === 0"
            @click="request(product)"
          >
            Solicitar <span>→</span>
          </button>
        </div>
        <div v-else class="locked-message">Sin unidades disponibles.</div>
      </article>
    </div>
    <Transition name="lightbox">
      <div
        v-if="zoomedProduct"
        class="image-lightbox"
        @click.self="zoomedProduct = null"
      >
        <div class="lightbox-card">
          <button
            class="lightbox-close"
            aria-label="Cerrar imagen"
            @click="zoomedProduct = null"
          >
            ×</button
          ><img
            :src="`/assets/products/${zoomedProduct.ref}.jpg`"
            :alt="zoomedProduct.name"
          />
          <div class="lightbox-caption">
            <span class="line-tag" :class="`line-tag--${zoomedProduct.accent}`"
              >{{ zoomedProduct.line }} · {{ zoomedProduct.ref }}</span
            ><strong>{{ zoomedProduct.name }}</strong
            ><small>Imagen de producto · Haz clic fuera para cerrar</small>
          </div>
        </div>
      </div>
    </Transition>
  </section>
</template>
