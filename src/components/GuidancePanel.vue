<template>
  <div v-if="store.guidance?.enabled" class="guidance-panel" role="region" aria-live="polite">
    <div class="guidance-header">
      <strong>Assistant</strong>
      <div class="guidance-controls-inline">
        <select v-model="level" @change="changeLevel">
          <option value="partial">Partial</option>
          <option value="guided">Guided</option>
        </select>
        <button class="text-button" @click="store.toggleGuidance()">×</button>
      </div>
    </div>

    <div class="guidance-body">
      <p v-if="suggestion">{{ suggestion }}</p>
      <p v-else>Explore products, try filters, or enable guidance for tips.</p>
    </div>

    <div class="guidance-actions">
      <template v-if="hasSequence">
        <div style="flex:1">
          <strong>Step {{ currentIndex + 1 }} / {{ sequence.length }}:</strong>
          <span>Point me to {{ sequence[currentIndex].label }}</span>
        </div>
        <div style="display:flex;gap:8px">
          <button type="button" class="button-soft" @click="prevStep" :disabled="currentIndex === 0">Previous</button>
          <button type="button" class="button-soft" @click="nextStep">Next</button>
          <button type="button" class="button" @click="finishSequence">Finish</button>
        </div>
      </template>

      <template v-else>
        <button type="button" class="button-soft" @click="startDefaultTour">Start assistant tour</button>
        <button type="button" class="button" @click="openCart">View cart</button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '../stores/productStore'

const store = useProductStore()
const router = useRouter()
const level = ref(store.guidance?.level ?? 'partial')

const suggestion = computed(() => store.guidanceSuggestion)

const sequence = computed(() => store.guidance?.sequence ?? [])
const currentIndex = computed(() => Number(store.guidance?.currentStep ?? 0))
const hasSequence = computed(() => Array.isArray(sequence.value) && sequence.value.length > 0)

watch(() => store.guidance?.level, (v) => {
  level.value = v ?? 'partial'
})

function changeLevel() {
  store.setGuidanceLevel(level.value)
}

function focusFilters() {
  // navigate to shop and highlight the filters section briefly
  router.push({ path: '/shop', query: { focus: 'filters' } })
  store.setHighlightTargets(['filters-bar'])
  // clear highlight after 6s
  setTimeout(() => store.clearHighlightTargets(), 6000)
}

function startDefaultTour() {
  const defaultSequence = [
    { target: 'filters-bar', label: 'filters' },
    { target: 'compare-tray', label: 'compare area' },
    { target: 'product-buybox', label: 'product buybox' },
  ]

  store.startSequence(defaultSequence)
}

function nextStep() {
  store.advanceSequence()
}

function prevStep() {
  store.previousSequence()
}

function finishSequence() {
  store.endSequence()
}

function openCart() {
  router.push('/cart')
}
</script>
