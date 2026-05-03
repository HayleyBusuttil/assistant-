<template>
  <div class="help-panel">
    <button v-if="!store.guidance?.enabled" class="help-launch" @click="openAssistant">Need help</button>
  </div>
</template>

<script setup>
import { useProductStore } from '../stores/productStore'

const store = useProductStore()

function openAssistant() {
  store.openAssistantPanel()
  store.trackInteraction('help_open')
}
</script>

<style scoped>
.help-panel {
  position: fixed;
  right: 20px;
  bottom: 80px;
  z-index: 1300;
}
.help-launch {
  background: linear-gradient(135deg, var(--accent) 0%, #5ca18f 100%);
  color: #fff;
  border: 0;
  padding: 10px 14px;
  border-radius: 999px;
  font-weight: 700;
  box-shadow: 0 14px 36px rgba(35,45,68,0.14);
  cursor: pointer;
}
</style>