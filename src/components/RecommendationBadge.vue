<template>
  <span class="recommendation-badge" :title="label">{{ label }}</span>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  label: { type: String, default: 'Suggested' },
})
</script>

<style scoped>
.recommendation-badge {
  display: inline-block;
  padding: 6px 10px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(92,161,143,0.12), rgba(35,45,68,0.06));
  color: var(--accent);
  font-weight: 700;
  font-size: 0.8rem;
  border: 1px solid rgba(92,161,143,0.18);
  box-shadow: 0 6px 18px rgba(35,45,68,0.04);
}
</style>