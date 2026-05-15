<template>
  <Transition name="toast-fade">
    <section
      v-if="store.toast"
      class="app-toast"
      :class="[`app-toast-${store.toast.type}`]"
      role="status"
      aria-live="polite"
    >
      <div class="app-toast-copy">
        <p class="app-toast-title">{{ toastTitle }}</p>
        <p class="app-toast-body">{{ store.toast.message }}</p>
      </div>

      <button type="button" class="app-toast-dismiss" @click="store.dismissToast()">
        Dismiss
      </button>
    </section>
  </Transition>
</template>

<script setup>
import { computed, onBeforeUnmount, watch } from "vue"
import { useProductStore } from "../stores/productStore"

const store = useProductStore()

const toastTitle = computed(() => {
  const type = store.toast?.type ?? "success"

  if (type === "warning") {
    return "Attention"
  }

  if (type === "neutral") {
    return "Update"
  }

  return "Added to your flow"
})

let dismissTimer = null

watch(
  () => store.toast?.id ?? null,
  (toastId) => {
    if (dismissTimer) {
      window.clearTimeout(dismissTimer)
      dismissTimer = null
    }

    if (!toastId) {
      return
    }

    dismissTimer = window.setTimeout(() => {
      if (store.toast?.id === toastId) {
        store.dismissToast()
      }
    }, 7000)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (dismissTimer) {
    window.clearTimeout(dismissTimer)
  }
})
</script>
