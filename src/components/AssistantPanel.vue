<template>
  <aside v-if="store.guidance?.enabled" class="assistant-panel" role="region" aria-live="polite">
    <header class="assistant-header">
      <div>
        <p class="eyebrow">Assistant</p>
        <h3>Helpful, optional guidance</h3>
      </div>
      <button class="text-button" type="button" @click="closePanel">Close</button>
    </header>

    <div class="assistant-copy">
      <p v-if="store.guidanceSuggestion">{{ store.guidanceSuggestion }}</p>
      <p v-else>Not sure where to start? Try our best sellers or explore popular categories.</p>
    </div>

    <TooltipHint id="assistant-filter-tip" text="Tip: You can filter by category, collection, and price sorting here." :auto-hide="0" />

    <div class="assistant-actions">
      <button class="button-soft button-sm" type="button" @click="runDefaultTour">Show me recommendations</button>
      <button class="button-soft button-sm" type="button" @click="pointToFilters">How to use filters</button>
      <button class="button button-sm" type="button" @click="pointToAddToCart">Point to Add to Cart</button>
    </div>

    <div v-if="hasSequence" class="assistant-steps">
      <p>
        Step {{ currentStep + 1 }} / {{ steps.length }}:
        <strong>Point me to {{ steps[currentStep].label }}</strong>
      </p>
      <div class="assistant-actions">
        <button class="button-soft button-sm" type="button" :disabled="currentStep === 0" @click="store.previousSequence()">Previous</button>
        <button class="button-soft button-sm" type="button" @click="store.advanceSequence()">Next</button>
        <button class="button-sm button" type="button" @click="store.endSequence()">Finish</button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import TooltipHint from "./TooltipHint.vue"
import { useProductStore } from "../stores/productStore"

const store = useProductStore()
const route = useRoute()
const router = useRouter()

const steps = computed(() => store.guidance?.sequence ?? [])
const currentStep = computed(() => Number(store.guidance?.currentStep ?? 0))
const hasSequence = computed(() => steps.value.length > 0)

function closePanel() {
  store.closeAssistantPanel()
}

function runDefaultTour() {
  const sequence = [
    { target: "filters-bar", label: "filters" },
    { target: "recommendation-section", label: "recommended products" },
    { target: "compare-tray", label: "compare area" },
  ]
  store.startSequence(sequence)
  if (route.path !== "/shop") {
    router.push("/shop")
  }
}

function pointToFilters() {
  store.setHighlightTargets(["filters-bar"])
  if (route.path !== "/shop") {
    router.push("/shop")
  }
}

function pointToAddToCart() {
  store.setHighlightTargets(["add-to-cart"])
  if (!route.path.startsWith("/product")) {
    const firstId = store.filteredProducts?.[0]?.id ?? store.products?.[0]?.id
    if (firstId) {
      router.push(`/product/${firstId}`)
    }
  }
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
  margin-bottom: 10px;
}

.assistant-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.assistant-steps {
  margin-top: 12px;
  border-top: 1px solid var(--panel-border);
  padding-top: 10px;
}
</style>
