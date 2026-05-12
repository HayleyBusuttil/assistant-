<template>
  <aside v-if="store.guidance?.enabled" class="assistant-panel" role="region" aria-live="polite">
    <header class="assistant-header">
      <div>
        <p class="eyebrow">Assistant</p>
        <h3>Optional guidance</h3>
      </div>
      <button class="text-button" type="button" @click="closePanel">Close</button>
    </header>

    <div class="assistant-copy">
      <p>{{ message }}</p>
      <p v-if="contextTitle" class="assistant-context">
        <strong>{{ contextTitle }}</strong>
      </p>
      <p v-if="recommendationEyebrow" class="assistant-note">
        Showing: <strong>{{ recommendationEyebrow }}</strong>
      </p>
    </div>
  </aside>
</template>

<script setup>
import { computed } from "vue"
import { useProductStore } from "../stores/productStore"

const store = useProductStore()
const message = computed(() => store.shopAssistantMessage)
const recommendationEyebrow = computed(() => store.activeRecommendation?.eyebrow ?? "")
const contextTitle = computed(() => store.activeGuidanceContext?.title ?? "")

function closePanel() {
  store.closeAssistantPanel()
}
</script>

<style scoped>
.assistant-panel {
  position: fixed;
  right: 20px;
  bottom: 22px;
  width: min(420px, calc(100% - 32px));
  border-radius: 18px;
  border: 1px solid var(--panel-border);
  background: linear-gradient(180deg, var(--panel), var(--panel-strong));
  box-shadow: 0 18px 42px rgba(30, 26, 20, 0.1);
  padding: 14px;
  z-index: 1400;
}

.assistant-header {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: start;
}

.assistant-header h3 {
  margin: 0;
}

.assistant-copy {
  color: var(--muted);
}

.assistant-note {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--panel-border);
}

.assistant-context {
  margin: 12px 0 0;
  color: var(--heading);
}
</style>
