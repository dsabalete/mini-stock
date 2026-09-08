<script setup lang="ts">
import type { OrderRequest } from '../composables/useInventory'
defineProps<{ requests: OrderRequest[] }>()
const emit = defineEmits<{ manage: [requestId: number, decision: 'approved' | 'rejected'] }>()
</script>

<template>
  <section class="requests-panel">
    <div class="panel-heading">
      <div>
        <p class="eyebrow">Zona restringida · Operations</p>
        <h2>Solicitudes pendientes</h2>
        <p>Los artículos permanecen bloqueados hasta tomar una decisión.</p>
      </div><span class="admin-lock">▣ Solo administrador</span>
    </div>
    <div v-if="requests.filter((request) => request.status === 'pending').length" class="request-list">
      <article v-for="request in requests.filter((item) => item.status === 'pending')" :key="request.id"
        class="request-row">
        <div class="request-status">!</div>
        <div class="request-info"><strong>{{ request.productName }}</strong><span>{{ request.sku }} · {{
          request.quantity }} ud. · {{ request.createdAt }}</span></div>
        <div class="request-user"><span>Solicitado por</span><strong>{{ request.email }}</strong></div>
        <div class="request-actions"><button class="reject-button"
            @click="emit('manage', request.id, 'rejected')">Rechazar</button><button class="approve-button"
            @click="emit('manage', request.id, 'approved')">Aprobar pedido</button></div>
      </article>
    </div>
    <div v-else class="empty-requests"><span>✓</span><strong>No hay solicitudes pendientes</strong>
      <p>Los nuevos pedidos aparecerán aquí para su gestión.</p>
    </div>
  </section>
</template>
