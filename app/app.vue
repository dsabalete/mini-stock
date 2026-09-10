<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue'
import { useInventory } from './composables/useInventory'
import HelpDialog from './components/HelpDialog.vue'

const runtimeConfig = useRuntimeConfig()
const {
  activeFilter,
  filteredProducts,
  search,
  setFilter,
  selectedProduct,
  openMovement,
  closeMovement,
  recordMovement,
  metrics,
  recentMovements,
  movementOpen,
  requests,
  submitRequest,
  manageRequest,
  load,
  loading,
} = useInventory()
const email = shallowRef('')
const sessionEmail = shallowRef('')
const view = shallowRef<'public' | 'admin'>('public')
const toast = shallowRef('')
const loginError = shallowRef('')
const helpOpen = shallowRef(false)
const adminEmail = computed(() =>
  (runtimeConfig.public.adminEmail || '').trim().toLowerCase()
)
const isAdmin = computed(() => sessionEmail.value === adminEmail.value)
onMounted(() => load())

function enterWorkspace() {
  const normalizedEmail = email.value.trim().toLowerCase()
  if (!/^[^\s@]+@superwagen\.es$/.test(normalizedEmail)) {
    loginError.value =
      'Introduce un correo corporativo con dominio @superwagen.es.'
    return
  }
  loginError.value = ''
  sessionEmail.value = normalizedEmail
  view.value = isAdmin.value ? 'admin' : 'public'
}
async function requestProduct(productId: number, quantity: number) {
  try {
    await submitRequest(sessionEmail.value, productId, quantity)
    toast.value =
      'Solicitud enviada. El artículo queda bloqueado hasta su gestión.'
  } catch {
    toast.value = 'No se pudo enviar la solicitud. Comprueba la disponibilidad.'
  }
  window.setTimeout(() => {
    toast.value = ''
  }, 4000)
}
async function manage(id: number, decision: 'approved' | 'rejected') {
  await manageRequest(id, decision)
  toast.value =
    decision === 'approved'
      ? 'Pedido aprobado y stock actualizado.'
      : 'Solicitud rechazada. El artículo vuelve a estar disponible.'
  window.setTimeout(() => {
    toast.value = ''
  }, 4000)
}
</script>

<template>
  <div v-if="!sessionEmail" class="login-shell">
    <div class="login-grid"></div>
    <div class="login-card">
      <div class="brand-lockup">
        <div class="brand-mark"><span></span><span></span><span></span></div>
        <div>
          <p class="brand-name">Stock <span>F1</span></p>
          <p class="brand-subtitle">Revolut hospitality</p>
        </div>
      </div>
      <p class="eyebrow">Portal de regalos · 2026</p>
      <h1>Bienvenido al<br /><em>paddock.</em></h1>
      <p class="login-copy">
        Accede con tu correo corporativo para consultar el catálogo y solicitar
        tus regalos de equipo.
      </p>
      <label class="login-label" for="email">Correo corporativo</label
      ><input
        id="email"
        v-model="email"
        class="login-input"
        :class="{ 'login-input--error': loginError }"
        type="email"
        placeholder="nombre@superwagen.es"
        @keyup.enter="enterWorkspace"
      />
      <p v-if="loginError" class="login-error">{{ loginError }}</p>
      <button class="primary-button login-button" @click="enterWorkspace">
        Entrar al catálogo <span>→</span>
      </button>
      <p class="login-hint">
        El stock es gestionado exclusivamente por Operations.
      </p>
    </div>
    <div class="login-footer">
      <span>Acceso interno · Uso corporativo</span>
    </div>
  </div>
  <div v-else class="app-shell">
    <div v-if="loading" class="loading-overlay">Cargando inventario…</div>
    <aside class="sidebar">
      <div class="brand-lockup">
        <div class="brand-mark"><span></span><span></span><span></span></div>
        <div>
          <p class="brand-name">Stock <span>F1</span></p>
          <p class="brand-subtitle">Revolut hospitality</p>
        </div>
      </div>
      <nav class="main-nav" aria-label="Navegación principal">
        <p class="nav-label">Workspace</p>
        <button
          class="nav-item nav-item--active"
          @click="view = isAdmin ? 'admin' : 'public'"
        >
          <span class="nav-icon">▦</span>
          {{ isAdmin ? 'Panel de control' : 'Catálogo de regalos' }}</button
        ><button v-if="isAdmin" class="nav-item" @click="view = 'admin'">
          <span class="nav-icon">♢</span> Solicitudes
          <span class="nav-count nav-count--red">{{
            metrics.pendingRequests
          }}</span></button
        ><button class="nav-item" @click="view = 'public'">
          <span class="nav-icon">⌘</span> Ver catálogo
        </button>
        <p class="nav-label nav-label--spaced">Estado</p>
        <div class="sidebar-status">
          <i></i>
          <div>
            <strong>Operativo</strong
            ><span>Última sincronización<br />hace 2 min</span>
          </div>
        </div>
      </nav>
      <div class="sidebar-bottom">
        <div class="user-profile">
          <div class="avatar">
            {{ isAdmin ? 'OP' : sessionEmail.slice(0, 2).toUpperCase() }}
          </div>
          <div>
            <strong>{{
              isAdmin ? 'Operations' : sessionEmail.split('@')[0]
            }}</strong
            ><span>{{ isAdmin ? 'Administrator' : 'Team member' }}</span>
          </div>
          <button
            class="more-button"
            aria-label="Cerrar sesión"
            @click="sessionEmail = ''"
          >
            ↪
          </button>
        </div>
      </div>
    </aside>
    <main class="main-content">
      <header class="topbar">
        <div class="breadcrumb">
          <span>Workspace</span><b>/</b
          ><strong>{{
            view === 'admin' ? 'Panel de control' : 'Catálogo de regalos'
          }}</strong>
        </div>
        <div class="top-actions">
          <span class="role-badge" :class="{ 'role-badge--admin': isAdmin }">{{
            isAdmin ? 'Administrador' : sessionEmail
          }}</span
          ><button
            class="help-button"
            type="button"
            aria-label="Abrir ayuda"
            :aria-expanded="helpOpen"
            aria-controls="help-dialog"
            @click="helpOpen = true"
          >
            ?
          </button>
        </div>
      </header>
      <template v-if="view === 'public'">
        <PublicCatalog
          :products="filteredProducts"
          :email="sessionEmail"
          @request="requestProduct"
        />
      </template>
      <template v-else>
        <section class="page-intro">
          <div>
            <p class="eyebrow">Zona privada · Operations</p>
            <h1>Centro de control</h1>
            <p class="intro-copy">
              Gestiona las solicitudes y modifica el stock del programa de
              regalos.
            </p>
          </div>
          <button class="primary-button" @click="openMovement()">
            <span>＋</span> Registrar movimiento
          </button>
        </section>
        <section class="metrics-grid" aria-label="Resumen de inventario">
          <div class="metric-card metric-card--hero">
            <div class="metric-top">
              <span class="metric-label">Unidades en stock</span
              ><span class="metric-badge">+8.4% <span>↗</span></span>
            </div>
            <strong class="metric-number">{{ metrics.totalStock }}</strong>
            <div class="metric-foot">
              <span>unidades físicas</span
              ><span class="mini-bars"
                ><i
                  v-for="bar in [35, 52, 42, 72, 55, 82, 66, 92]"
                  :key="bar"
                  :style="{ height: `${bar}%` }"
                ></i
              ></span>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-top">
              <span class="metric-label">Solicitudes</span
              ><span class="metric-icon metric-icon--red">!</span>
            </div>
            <strong class="metric-number metric-number--small">{{
              metrics.pendingRequests
            }}</strong>
            <div class="metric-foot">
              <span>pendientes de gestión</span
              ><span class="metric-note metric-note--red"
                >Acción requerida</span
              >
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-top">
              <span class="metric-label">Artículos bloqueados</span
              ><span class="metric-icon metric-icon--amber">▣</span>
            </div>
            <strong class="metric-number metric-number--small">{{
              metrics.lockedItems
            }}</strong>
            <div class="metric-foot">
              <span>reservas en revisión</span
              ><span class="metric-note metric-note--amber">En espera</span>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-top">
              <span class="metric-label">Valor de inventario</span
              ><span class="metric-icon">€</span>
            </div>
            <strong class="metric-number metric-number--small">{{
              metrics.inventoryValue
            }}</strong>
            <div class="metric-foot">
              <span>precio de coste</span
              ><span class="metric-note">estable</span>
            </div>
          </div>
        </section>
        <AdminRequests :requests="requests" @manage="manage" />
        <section class="workspace-panel" id="inventario">
          <div class="panel-heading">
            <div>
              <h2>Inventario actual</h2>
              <p>Solo el administrador puede modificar las unidades.</p>
            </div>
            <div class="panel-tools">
              <button class="secondary-button">⇩ <span>Exportar</span></button>
            </div>
          </div>
          <div class="filter-row">
            <label class="search-box"
              ><span>⌕</span
              ><input
                v-model="search"
                type="search"
                placeholder="Buscar por producto, referencia..."
            /></label>
            <div class="filter-tabs">
              <button
                :class="{ active: activeFilter === 'all' }"
                @click="setFilter('all')"
              >
                Todos <b>12</b></button
              ><button
                :class="{ active: activeFilter === 'available' }"
                @click="setFilter('available')"
              >
                Disponibles</button
              ><button
                :class="{ active: activeFilter === 'low' }"
                @click="setFilter('low')"
              >
                Stock bajo
              </button>
            </div>
          </div>
          <InventoryTable
            :products="filteredProducts"
            @movement="openMovement"
          />
        </section>
        <section class="bottom-grid" id="movimientos">
          <div class="activity-panel">
            <div class="panel-heading panel-heading--compact">
              <div>
                <h2>Actividad reciente</h2>
                <p>Solicitudes y movimientos del equipo</p>
              </div>
            </div>
            <div class="activity-list">
              <div
                v-for="item in recentMovements"
                :key="item.id"
                class="activity-row"
              >
                <div
                  class="activity-icon"
                  :class="`activity-icon--${item.type}`"
                >
                  {{ item.type === 'in' ? '↘' : '↗' }}
                </div>
                <div class="activity-copy">
                  <strong>{{ item.title }}</strong
                  ><span>{{ item.detail }}</span>
                </div>
                <div
                  class="activity-amount"
                  :class="`activity-amount--${item.type}`"
                >
                  {{ item.type === 'in' ? '+' : '-' }}{{ item.amount }}
                  <small>uds.</small>
                </div>
                <time>{{ item.time }}</time>
              </div>
            </div>
          </div>
          <div class="coverage-panel">
            <div class="panel-heading panel-heading--compact">
              <div>
                <h2>Reglas de acceso</h2>
                <p>Permisos activos en este workspace</p>
              </div>
            </div>
            <div class="access-rules">
              <div>
                <span class="rule-icon">@</span>
                <p>
                  <strong>Identificación corporativa</strong
                  ><small>Solo correos autorizados pueden solicitar</small>
                </p>
                <i>✓</i>
              </div>
              <div>
                <span class="rule-icon">▣</span>
                <p>
                  <strong>Bloqueo automático</strong
                  ><small>El artículo queda retenido al solicitar</small>
                </p>
                <i>✓</i>
              </div>
              <div>
                <span class="rule-icon">⌘</span>
                <p>
                  <strong>Gestión centralizada</strong
                  ><small>Solo Operations modifica el stock</small>
                </p>
                <i>✓</i>
              </div>
            </div>
          </div>
        </section>
      </template>
    </main>
    <StockMovementPanel
      :open="movementOpen"
      :product="selectedProduct"
      @close="closeMovement"
      @save="recordMovement"
    />
    <HelpDialog :open="helpOpen" @close="helpOpen = false" />
    <Transition name="toast">
      <div v-if="toast" class="toast-message"><span>✓</span>{{ toast }}</div>
    </Transition>
  </div>
</template>
