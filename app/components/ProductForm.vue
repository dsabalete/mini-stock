<script setup lang="ts">
import { reactive, shallowRef } from 'vue'

export type NewProductPayload = {
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

defineProps<{ saving: boolean }>()
const emit = defineEmits<{ submit: [payload: NewProductPayload] }>()
const error = shallowRef('')
const form = reactive<NewProductPayload>(emptyProduct())

function emptyProduct(): NewProductPayload {
  return {
    line: '',
    name: '',
    sku: '',
    ref: '',
    stockSC: 0,
    stockSBD: 0,
    incoming: 0,
    cost: 0,
    price: 0,
    accent: 'amber',
  }
}

function submit() {
  if (
    !form.line.trim() ||
    !form.name.trim() ||
    !form.sku.trim() ||
    !form.ref.trim()
  ) {
    error.value = 'Completa la línea, el nombre, el SKU y la referencia.'
    return
  }
  error.value = ''
  emit('submit', { ...form })
}

function reset() {
  Object.assign(form, emptyProduct())
  error.value = ''
}

defineExpose({ reset })
</script>

<template>
  <form class="product-form" @submit.prevent="submit">
    <div class="product-form-grid">
      <label class="form-field">
        <span class="form-label">Línea</span>
        <input v-model="form.line" required placeholder="Ej. APPAREL" />
      </label>
      <label class="form-field form-field--wide">
        <span class="form-label">Producto / descripción</span>
        <input v-model="form.name" required placeholder="Nombre del producto" />
      </label>
      <label class="form-field">
        <span class="form-label">SKU</span>
        <input v-model="form.sku" required placeholder="31 3260000" />
      </label>
      <label class="form-field">
        <span class="form-label">Referencia</span>
        <input v-model="form.ref" required placeholder="KE0000" />
      </label>
      <label class="form-field">
        <span class="form-label">Stock SC</span>
        <input v-model.number="form.stockSC" min="0" type="number" />
      </label>
      <label class="form-field">
        <span class="form-label">Stock SBD</span>
        <input v-model.number="form.stockSBD" min="0" type="number" />
      </label>
      <label class="form-field">
        <span class="form-label">Por recibir</span>
        <input v-model.number="form.incoming" min="0" type="number" />
      </label>
      <label class="form-field">
        <span class="form-label">Precio de coste (€)</span>
        <input v-model.number="form.cost" min="0" step="0.01" type="number" />
      </label>
      <label class="form-field">
        <span class="form-label">PVP (€)</span>
        <input v-model.number="form.price" min="0" step="0.01" type="number" />
      </label>
      <label class="form-field">
        <span class="form-label">Color de estado</span>
        <select v-model="form.accent">
          <option value="red">Rojo</option>
          <option value="amber">Ámbar</option>
          <option value="green">Verde</option>
        </select>
      </label>
    </div>
    <p v-if="error" class="login-error">{{ error }}</p>
    <div class="product-form-actions">
      <button class="primary-button" type="submit" :disabled="saving">
        {{ saving ? 'Guardando…' : 'Añadir producto' }}
      </button>
    </div>
  </form>
</template>
