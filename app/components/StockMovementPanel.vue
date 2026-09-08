<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import type { Product } from '../composables/useInventory'
const props = defineProps<{ open: boolean; product: Product | null }>()
const emit = defineEmits<{ close: []; save: [payload: { productId: number; type: 'in' | 'out'; quantity: number; location: 'SC' | 'SBD'; note: string }] }>()
const type = shallowRef<'in' | 'out'>('in')
const location = shallowRef<'SC' | 'SBD'>('SC')
const quantity = shallowRef(1)
const note = shallowRef('')
watch(() => props.open, (open) => { if (open) { type.value = 'in'; location.value = 'SC'; quantity.value = 1; note.value = '' } })
const selectedName = computed(() => props.product?.name ?? 'Selecciona una referencia')
function save() { if (props.product && quantity.value > 0) emit('save', { productId: props.product.id, type: type.value, quantity: quantity.value, location: location.value, note: note.value }) }
</script>

<template>
  <Transition name="drawer">
    <div v-if="open" class="drawer-backdrop" @click.self="emit('close')">
      <aside class="movement-drawer">
        <div class="drawer-header">
          <div>
            <p class="eyebrow">Movimiento de stock</p>
            <h2>Registrar movimiento</h2>
          </div><button class="close-button" aria-label="Cerrar" @click="emit('close')">×</button>
        </div>
        <div class="drawer-body"><label class="form-label">Referencia</label>
          <div class="selected-product"><span class="selected-product-icon">▦</span>
            <div><strong>{{ selectedName }}</strong><span>{{ product?.sku }} · {{ product?.ref }}</span></div>
          </div><label class="form-label">Ubicación</label>
          <div class="movement-toggle"><button :class="{ active: location === 'SC' }"
              @click="location = 'SC'"><span>SC</span> Sant Cugat</button><button
              :class="{ active: location === 'SBD' }" @click="location = 'SBD'"><span>SBD</span> Sabadell</button></div>
          <label class="form-label">Tipo de movimiento</label>
          <div class="movement-toggle"><button :class="{ active: type === 'in' }" @click="type = 'in'"><span>↘</span>
              Entrada</button><button :class="{ active: type === 'out' }" @click="type = 'out'"><span>↗</span>
              Salida</button></div><label class="form-label" for="quantity">Unidades</label>
          <div class="quantity-input"><button @click="quantity = Math.max(1, quantity - 1)">−</button><input
              id="quantity" v-model.number="quantity" type="number" min="1" /><button @click="quantity++">＋</button>
          </div><label class="form-label" for="note">Nota <span>(opcional)</span></label><textarea id="note"
            v-model="note" rows="3" placeholder="Ej. Pedido AD-2026-042"></textarea>
          <div class="drawer-summary"><span>Total después del movimiento</span><strong>{{ (product?.stock ?? 0) + (type
            === 'in' ? quantity : -quantity) }} uds.</strong></div>
        </div>
        <div class="drawer-footer"><button class="secondary-button" @click="emit('close')">Cancelar</button><button
            class="primary-button" :disabled="!product" @click="save">Guardar movimiento</button></div>
      </aside>
    </div>
  </Transition>
</template>
