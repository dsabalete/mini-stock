<script setup lang="ts">
import { nextTick, onBeforeUnmount, watch, useTemplateRef } from 'vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const closeButton = useTemplateRef<HTMLButtonElement>('closeButton')

function close() {
  emit('close')
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    document.addEventListener('keydown', onKeydown)
    await nextTick()
    closeButton.value?.focus()
  } else {
    document.removeEventListener('keydown', onKeydown)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Transition name="help">
    <div v-if="open" class="help-backdrop" @click.self="close">
      <section
        id="help-dialog"
        class="help-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-dialog-title"
      >
        <div class="help-dialog__header">
          <div>
            <p class="eyebrow">Centro de ayuda</p>
            <h2 id="help-dialog-title">¿Necesitas una guía rápida?</h2>
          </div>
          <button ref="closeButton" class="help-dialog__close" type="button" aria-label="Cerrar ayuda" @click="close">
            ×
          </button>
        </div>

        <div class="help-dialog__body">
          <p class="help-dialog__intro">Aquí tienes lo esencial para moverte por Stock F1.</p>
          <div class="help-topics">
            <article class="help-topic">
              <span class="help-topic__index">01</span>
              <div>
                <h3>Consulta el catálogo</h3>
                <p>Explora los regalos disponibles y revisa el stock antes de hacer una solicitud.</p>
              </div>
            </article>
            <article class="help-topic">
              <span class="help-topic__index">02</span>
              <div>
                <h3>Solicita un artículo</h3>
                <p>Selecciona un producto, indica la cantidad y envía la solicitud con tu correo corporativo.</p>
              </div>
            </article>
            <article class="help-topic">
              <span class="help-topic__index">03</span>
              <div>
                <h3>¿Eres Operations?</h3>
                <p>Gestiona las solicitudes pendientes y actualiza las unidades desde el panel de control.</p>
              </div>
            </article>
          </div>
          <div class="help-contact">
            <span class="help-contact__icon">?</span>
            <p><strong>¿Algo no funciona?</strong><span>Contacta con Operations para recibir asistencia.</span></p>
          </div>
        </div>
      </section>
    </div>
  </Transition>
</template>
