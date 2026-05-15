<template>
  <section v-if="products.length" class="recommendation-section">
    <div class="section-heading">
      <div>
        <p class="eyebrow">{{ eyebrow }}</p>
        <h2>{{ title }}</h2>
      </div>
      <p v-if="helperText" class="recommendation-helper">{{ helperText }}</p>
    </div>

    <div class="product-grid related-grid">
      <ProductCard
        v-for="item in products"
        :key="item.id"
        :product="item"
        :is-compared="comparison.includes(item.id)"
        :compare-disabled="comparison.length >= 2"
        :recommendation-label="productLabel"
        :recommendation-reason="item.recommendationReason"
        @quick-add="emit('quick-add', item.id)"
        @compare="emit('compare', item.id)"
      />
    </div>
  </section>
</template>

<script setup>
import ProductCard from "./ProductCard.vue"

defineProps({
  eyebrow: { type: String, default: "Suggested for you" },
  title: { type: String, required: true },
  helperText: { type: String, default: "" },
  products: { type: Array, default: () => [] },
  comparison: { type: Array, default: () => [] },
  productLabel: { type: String, default: "Recommended" },
})

const emit = defineEmits(["quick-add", "compare"])
</script>

<style scoped>
.recommendation-section {
  margin-top: 20px;
}

.recommendation-helper {
  color: var(--muted);
}
</style>
