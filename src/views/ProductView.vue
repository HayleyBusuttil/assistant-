<template>
  <section v-if="product" class="page page-product">
    <div v-if="store.toast" class="toast" :class="`toast-${store.toast.type}`">
      <span>{{ store.toast.message }}</span>
      <button type="button" @click="store.dismissToast()">×</button>
    </div>

    <nav class="breadcrumbs">
      <RouterLink to="/shop">Shop</RouterLink>
      <span>/</span>
      <RouterLink :to="`/shop?category=${product.category}`">{{ product.category }}</RouterLink>
      <span>/</span>
      <span>{{ product.name }}</span>
    </nav>

    <div class="product-detail-layout">
      <div class="product-visual">
        <img :src="product.image" :alt="product.name" loading="eager" decoding="async" fetchpriority="high" />
        <span class="product-chip">{{ product.badge }}</span>
      </div>

      <aside class="product-buybox" :class="{ 'highlighted-guidance': store.guidance?.highlightTargets?.includes('product-buybox') }">
        <p class="eyebrow">{{ product.category }}</p>
        <h1>{{ product.name }}</h1>
        <p class="lead">{{ product.summary }}</p>

        <div class="price-row">
          <strong>€{{ product.price }}</strong>
          <span v-if="product.originalPrice">€{{ product.originalPrice }}</span>
        </div>

        <div class="meta-row">
          <span>{{ product.rating.toFixed(1) }} rating</span>
          <span>{{ product.reviews }} reviews</span>
          <span>{{ product.stock }} left</span>
        </div>
        <div class="selection-panel">
          <label class="input-group">
            <span>Color</span>
            <select v-model="selectedColor">
              <option v-for="color in product.colors" :key="color" :value="color">{{ color }}</option>
            </select>
          </label>

          <div class="input-group">
            <span>Size</span>
            <div class="size-options">
              <button
                v-for="size in sizes"
                :key="size"
                type="button"
                class="size-pill"
                :class="{ active: selectedSize === size }"
                @click="selectedSize = size"
              >
                {{ size }}
              </button>
            </div>
          </div>

          <label class="input-group">
            <span>Quantity</span>
            <div class="quantity-control">
              <button type="button" @click="decreaseQuantity">−</button>
              <input v-model.number="quantity" type="number" min="1" :max="product.stock" />
              <button type="button" @click="increaseQuantity">+</button>
            </div>
          </label>
        </div>

        <div class="button-row">
          <button
            class="button primary-add"
            type="button"
            :class="{ 'highlighted-guidance': store.guidance?.highlightTargets?.includes('add-to-cart') }"
            @click="addToCart"
          >
            Add {{ quantity }} to cart
          </button>
          <button
            class="button button-soft"
            type="button"
            :class="{
              active: store.comparison.includes(product.id),
              'highlighted-guidance': store.guidance?.highlightTargets?.includes('compare-button'),
            }"
            @click="store.toggleComparison(product.id)"
          >
            {{ store.comparison.includes(product.id) ? "Remove comparison" : "Compare item" }}
          </button>
          <button
            class="button button-ghost product-favorite-button"
            type="button"
            :class="{
              active: store.favorites.includes(product.id),
              'highlighted-guidance': store.guidance?.highlightTargets?.includes('favorite-button'),
            }"
            @click="toggleFavorite"
          >
            {{ store.favorites.includes(product.id) ? "Saved to favourites" : "Save to favourites" }}
          </button>
          <RouterLink class="button button-soft" to="/cart">Go to cart</RouterLink>
        </div>

        <p class="support-copy">
          Free shipping over €180 and a 30-day return policy. This page gives shoppers enough context to move from browsing into buying.
        </p>

        <ContextualGuidance
          v-if="showBuyboxGuidance"
          :context-id="store.activeGuidanceContext?.id"
          :show-highlight="store.activeGuidanceContext?.target !== 'product-buybox'"
        />
      </aside>
    </div>

    <section class="detail-blocks">
      <article class="detail-card">
        <p class="eyebrow">Description</p>
        <p>{{ product.description }}</p>
      </article>

      <article class="detail-card">
        <p class="eyebrow">Highlights</p>
        <ul class="feature-list">
          <li v-for="item in product.details" :key="item">{{ item }}</li>
        </ul>
      </article>

      <article class="detail-card">
        <p class="eyebrow">Decision support</p>
        <p>
          Details, size options, color choices, and comparison support make the product page more useful for realistic shopping tasks.
        </p>
      </article>
    </section>

    <RecommendationSection
      v-if="relatedProducts.length"
      eyebrow="Recommended based on your selection"
      title="Similar products worth exploring"
      helper-text="Related styles stay available while you browse this item."
      product-label="Recommended"
      :products="relatedProducts"
      :comparison="store.comparison"
      @quick-add="store.addToCart"
      @compare="store.toggleComparison"
    />

    <RecommendationSection
      v-if="alsoViewedProducts.length"
      eyebrow="Users also viewed"
      title="Recently explored alongside this product"
      helper-text="A lightweight trail based on browsing behaviour, not a required next step."
      product-label="Also viewed"
      :products="alsoViewedProducts"
      :comparison="store.comparison"
      @quick-add="store.addToCart"
      @compare="store.toggleComparison"
    />

    <AssistantPanel />
    <HelpPanel />
  </section>

  <section v-else class="page empty-detail">
    <div class="empty-state">
      <h1>Product not found.</h1>
      <p>The item may have moved. Return to the shop and keep browsing.</p>
      <RouterLink class="button" to="/shop">Back to shop</RouterLink>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from "vue"
import { useRoute } from "vue-router"
import { useProductStore } from "../stores/productStore"
import HelpPanel from "../components/HelpPanel.vue"
import AssistantPanel from "../components/AssistantPanel.vue"
import RecommendationSection from "../components/RecommendationSection.vue"
import ContextualGuidance from "../components/ContextualGuidance.vue"

const route = useRoute()
const store = useProductStore()

const product = computed(() => store.productById(route.params.id))
const sizes = ["XS", "S", "M", "L", "XL"]
const quantity = ref(1)
const selectedColor = ref("")
const selectedSize = ref("M")

watch(
  product,
  (value) => {
    selectedColor.value = value?.colors?.[0] ?? ""
    selectedSize.value = "M"
    quantity.value = 1

    if (value) {
      store.trackEvent("view_product", { productId: value.id })
      store.registerProductView(value.id)
      store.maybeShowContextualGuidance([
        "customization-discovery",
        "wishlist-reassurance",
        "favorites-followup",
        "compare-entry",
      ])
    }
  },
  { immediate: true },
)

const relatedProducts = computed(() =>
  store.recommendedProducts({
    category: product.value?.category ?? null,
    collection: product.value?.collection ?? null,
    excludeIds: product.value ? [product.value.id] : [],
    limit: 4,
  }),
)

const alsoViewedProducts = computed(() => {
  if (!product.value) {
    return []
  }

  return store.recentlyViewed
    .filter((id) => id !== product.value.id)
    .map((id) => store.productById(id))
    .filter(Boolean)
    .slice(0, 4)
})

const showBuyboxGuidance = computed(() =>
  ["compare-entry", "customization-discovery", "wishlist-reassurance", "favorites-followup"].includes(
    store.activeGuidanceContext?.id ?? "",
  ),
)

function addToCart() {
  if (!product.value) {
    return
  }

  store.addToCart(product.value.id, quantity.value, selectedColor.value)
}

function toggleFavorite() {
  if (!product.value) {
    return
  }

  store.toggleFavorite(product.value.id)
  store.maybeShowContextualGuidance(["favorites-followup", "wishlist-reassurance"])
}

function increaseQuantity() {
  if (!product.value) {
    return
  }

  quantity.value = Math.min(product.value.stock, quantity.value + 1)
}

function decreaseQuantity() {
  quantity.value = Math.max(1, quantity.value - 1)
}
</script>
