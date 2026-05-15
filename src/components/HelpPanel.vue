<template>
  <div class="help-panel">
    <button v-if="!store.guidance?.enabled" class="help-launch" @click="openAssistant">
      <span class="help-launch-icon" aria-hidden="true">i</span>
      <span>Optional help</span>
    </button>
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
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, var(--accent) 0%, #5ca18f 100%);
  color: #fff;
  border: 0;
  padding: 10px 14px;
  border-radius: 999px;
  font-weight: 700;
  box-shadow: 0 14px 36px rgba(35,45,68,0.14);
  cursor: pointer;
}

.help-launch-icon {
  width: 22px;
  height: 22px;
  display: inline-grid;
  place-items: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.26);
  font-size: 0.84rem;
  font-weight: 700;
  line-height: 1;
}
</style>
