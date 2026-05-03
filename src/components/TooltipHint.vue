<template>
  <div class="tooltip-hint" v-if="visible" role="status" aria-live="polite">
    <div class="hint-body">
      <slot>{{ text }}</slot>
    </div>
    <button class="hint-dismiss" @click="dismiss">×</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProductStore } from '../stores/productStore'

const props = defineProps({
  id: { type: String, required: true },
  text: { type: String, default: 'Tip' },
  autoHide: { type: Number, default: 6000 },
})

const store = useProductStore()
const visible = ref(!store.hasSeenTip(props.id))

function dismiss() {
  visible.value = false
  store.dismissTip(props.id)
}

onMounted(() => {
  if (visible.value && props.autoHide > 0) {
    setTimeout(() => {
      if (visible.value) dismiss()
    }, props.autoHide)
  }
})
</script>

<style scoped>
.tooltip-hint {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  background: #fffdf9;
  border: 1px solid #e6ddd1;
  padding: 8px 10px;
  border-radius: 10px;
  box-shadow: 0 12px 30px rgba(35,45,68,0.06);
}
.hint-body { color: var(--muted); font-size: 0.92rem }
.hint-dismiss { border: 0; background: transparent; font-weight: 700; cursor: pointer }
</style>