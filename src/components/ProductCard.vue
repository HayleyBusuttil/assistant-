<template>
  <article
    class="product-card"
    :class="{
      'is-compared': isCompared,
      'is-recommended': Boolean(recommendationLabel),
      'is-favorited': isFavorited,
      'highlighted-guidance': highlightTargets.includes('compare-button') || highlightTargets.includes('favorite-button'),
    }"
  >
    <RouterLink class="product-card-media" :to="`/product/${product.id}`">
      <img :src="product.image" :alt="product.name" loading="lazy" decoding="async" />
      <span class="product-chip">{{ product.badge }}</span>
      <RecommendationBadge v-if="recommendationLabel" :label="recommendationLabel" />
    </RouterLink>

    <button
      type="button"
      class="favorite-button"
      :class="{ active: isFavorited }"
      :aria-pressed="isFavorited"
      :title="isFavorited ? 'Remove from favourites' : 'Save to favourites'"
      @click.prevent.stop="toggleFavorite"
    >
      {{ isFavorited ? "Saved" : "Save" }}
    </button>

    <div class="product-card-body">
      <div class="product-card-topline">
        <span>{{ product.category }}</span>
        <span>{{ product.rating.toFixed(1) }} / 5</span>
      </div>

      <RouterLink class="product-card-title" :to="`/product/${product.id}`">
        {{ product.name }}
      </RouterLink>

      <p class="product-card-summary">{{ product.summary }}</p>

      <TooltipHint
        v-if="showCompareHelper"
        id="compare-card-helper"
        text="Compare two items side-by-side to spot price, rating, and stock differences."
        :auto-hide="7000"
      />

      <TooltipHint
        v-else-if="showFavoriteHelper"
        id="favorite-card-helper"
        text="Save favourites to build a shortlist without adding anything to your cart."
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
  recommendationLabel: {
    type: String,
    default: "",
  },
})
const { product, isCompared, compareDisabled } = toRefs(props)

const emit = defineEmits(["quick-add", "compare"])
const store = useProductStore()
const isFavorited = computed(() => store.favorites.includes(product.value.id))
const highlightTargets = computed(() => store.guidance?.highlightTargets ?? [])
const showCompareHelper = computed(() => !store.hasSeenTip("compare-card-helper") && highlightTargets.value.includes("compare-button"))
const showFavoriteHelper = computed(() => !store.hasSeenTip("favorite-card-helper") && highlightTargets.value.includes("favorite-button"))

function onQuickAdd() {
  emit('quick-add')
  store.trackInteraction('quick_add', { productId: product.value.id })
}

function toggleFavorite() {
  store.toggleFavorite(product.value.id)
  store.trackInteraction('toggle_favorite', { productId: product.value.id })
}
</script>
