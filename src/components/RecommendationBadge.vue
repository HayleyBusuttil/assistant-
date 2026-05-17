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
  background: rgba(255, 255, 255, 0.94);
  color: #111111;
  font-weight: 700;
  font-size: 0.8rem;
  border: 1px solid rgba(17, 17, 17, 0.12);
  box-shadow: 0 10px 24px rgba(17, 17, 17, 0.12);
}
</style>
