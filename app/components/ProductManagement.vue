<script setup lang="ts">
import ProductForm, { type NewProductPayload } from './ProductForm.vue'

defineProps<{ saving: boolean }>()
const emit = defineEmits<{ submit: [payload: NewProductPayload] }>()
</script>

<template>
  <section class="workspace-panel product-management">
    <div class="panel-heading">
      <div>
        <p class="eyebrow">Zona privada · Administrator</p>
        <h2>Gestión de productos</h2>
        <p>Añade nuevas referencias al catálogo y define su stock inicial.</p>
      </div>
    </div>
    <ProductForm :saving="saving" @submit="emit('submit', $event)" />
  </section>
</template>
