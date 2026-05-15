<template>
  <article
    class="product-card"
    :class="{
      'is-compared': isCompared,
      'is-recommended': Boolean(recommendationLabel),
      'highlighted-guidance': highlightTargets.includes('compare-button'),
    }"
  >
    <RouterLink class="product-card-media" :to="`/product/${product.id}`">
      <img :src="product.image" :alt="product.name" loading="lazy" decoding="async" />
      <span class="product-chip">{{ product.badge }}</span>
      <RecommendationBadge v-if="recommendationLabel" :label="recommendationLabel" />
    </RouterLink>

    <div class="product-card-body">
      <div class="product-card-topline">
        <span>{{ product.category }}</span>
        <span>{{ product.rating.toFixed(1) }} / 5</span>
      </div>

      <RouterLink class="product-card-title" :to="`/product/${product.id}`">
        {{ product.name }}
      </RouterLink>

      <p class="product-card-summary">{{ product.summary }}</p>
      <p v-if="recommendationReason" class="product-card-reason">{{ recommendationReason }}</p>

      <TooltipHint
        v-if="showCompareHelper"
        id="compare-card-helper"
        text="Compare two items side-by-side to spot price, rating, and stock differences."
        :auto-hide="7000"
      />

      <div class="product-card-footer">
        <div>
          <strong>€{{ product.price }}</strong>
          <span v-if="product.originalPrice" class="product-price-was">€{{ product.originalPrice }}</span>
        </div>
      </div>

      <div class="product-card-actions">
        <button class="button button-ghost button-sm" type="button" @click.stop="onQuickAdd">
          Quick add
        </button>

        <button
          class="button-soft button-sm compare-button"
          type="button"
          :class="{ active: isCompared }"
          :disabled="compareDisabled && !isCompared"
          @click.stop="emit('compare')"
        >
          {{ isCompared ? "Comparing" : "Compare" }}
        </button>
      </div>
    </div>
  </article>
</template>

<script setup>
import RecommendationBadge from './RecommendationBadge.vue'
import TooltipHint from './TooltipHint.vue'
import { useProductStore } from '../stores/productStore'
import { computed, toRefs } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  isCompared: {
    type: Boolean,
    default: false,
  },
  compareDisabled: {
    type: Boolean,
    default: false,
  },
  recommendationLabel: {
    type: String,
    default: "",
  },
  recommendationReason: {
    type: String,
    default: "",
  },
})
const { product, isCompared, compareDisabled, recommendationReason } = toRefs(props)

const emit = defineEmits(["quick-add", "compare"])
const store = useProductStore()
const highlightTargets = computed(() => store.guidance?.highlightTargets ?? [])
const showCompareHelper = computed(() => !store.hasSeenTip("compare-card-helper") && highlightTargets.value.includes("compare-button"))

function onQuickAdd() {
  emit('quick-add')
  store.trackInteraction('quick_add', { productId: product.value.id })
}
</script>
