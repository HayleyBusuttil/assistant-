<template>
  <article class="product-card" :class="{ 'is-compared': isCompared, 'is-recommended': isRecommended }">
    <RouterLink class="product-card-media" :to="`/product/${product.id}`">
      <img :src="product.image" :alt="product.name" loading="lazy" decoding="async" />
      <span class="product-chip">{{ product.badge }}</span>
      <RecommendationBadge v-if="isRecommended" label="Suggested" />
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

      <div class="product-card-footer">
        <div>
          <strong>€{{ product.price }}</strong>
          <span v-if="product.originalPrice" class="product-price-was">€{{ product.originalPrice }}</span>
        </div>
      </div>

      <div class="product-card-actions">
        <div style="display:flex;gap:8px;align-items:center">
          <button class="button button-ghost button-sm" type="button" @click.stop="onQuickAdd">
            Quick add
          </button>
          <TooltipHint :id="`quick-add-${props.product.id}`" text="Add quickly without leaving the page" />
        </div>

        <button
          class="button-soft button-sm compare-button"
          type="button"
          :class="{ active: isCompared }"
          :disabled="compareDisabled && !isCompared"
          @click.stop="emit('compare')"
        >
          {{ isCompared ? "Selected" : "Compare" }}
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
})
const { product, isCompared, compareDisabled } = toRefs(props)

const emit = defineEmits(["quick-add", "compare"])
const store = useProductStore()
const isRecommended = computed(() => {
  // small heuristic: featured badge or high rating
  return product.value?.badge === 'Featured' || (product.value?.rating ?? 0) >= 4.7
})

function onQuickAdd() {
  emit('quick-add')
  store.trackInteraction('quick_add', { productId: product.value.id })
}
</script>
