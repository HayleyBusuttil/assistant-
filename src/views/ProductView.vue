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
        <img :src="selectedImage" :alt="product.name" loading="eager" decoding="async" fetchpriority="high" />
        <span class="product-chip">{{ product.badge }}</span>

        <div class="product-gallery" v-if="galleryImages.length > 1">
          <button
            v-for="image in galleryImages"
            :key="image"
            class="gallery-thumb"
            :class="{ active: image === selectedImage }"
            type="button"
            @click="selectedImage = image"
            :aria-label="`Preview ${product.name}`"
          >
            <img :src="image" :alt="product.name" loading="lazy" decoding="async" />
          </button>
        </div>
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
        <TooltipHint :id="`trend-tip-${product.id}`" text="This item is trending this week." />

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
            :class="{ active: store.comparison.includes(product.id) }"
            @click="store.toggleComparison(product.id)"
          >
            {{ store.comparison.includes(product.id) ? "Remove comparison" : "Compare item" }}
          </button>
          <RouterLink class="button button-soft" to="/cart">Go to cart</RouterLink>
        </div>

        <p class="support-copy">
          Free shipping over €180 and a 30-day return policy. This page gives shoppers enough context to move from browsing into buying.
        </p>
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
      eyebrow="You may also like"
      title="Related products"
      helper-text="These styles are close to what you are viewing"
      :products="relatedProducts"
      :comparison="store.comparison"
      @quick-add="store.addToCart"
      @compare="store.toggleComparison"
    />

    <RecommendationSection
      eyebrow="Complete the outfit"
      title="Complementary picks"
      helper-text="Customers also viewed these with similar products"
      :products="complementaryProducts"
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
import TooltipHint from "../components/TooltipHint.vue"

const route = useRoute()
const store = useProductStore()

const product = computed(() => store.productById(route.params.id))
const sizes = ["XS", "S", "M", "L", "XL"]
const quantity = ref(1)
const selectedColor = ref("")
const selectedSize = ref("M")
const selectedImage = ref("")

const galleryImages = computed(() => {
  if (!product.value) {
    return []
  }

  const siblings = store.products
    .filter((item) => item.collection === product.value.collection)
    .map((item) => item.image)

  return [...new Set([product.value.image, ...siblings])].slice(0, 5)
})

watch(
  product,
  (value) => {
    selectedColor.value = value?.colors?.[0] ?? ""
    selectedSize.value = "M"
    selectedImage.value = value?.image ?? ""
    quantity.value = 1

    if (value) {
      store.trackEvent("view_product", { productId: value.id })
    }
  },
  { immediate: true },
)

watch(galleryImages, (images) => {
  if (!images.length) {
    return
  }

  if (!images.includes(selectedImage.value)) {
    selectedImage.value = images[0]
  }
})

const relatedProducts = computed(() =>
  store.products
    .filter((item) => item.id !== product.value?.id && item.category === product.value?.category)
    .slice(0, 3),
)

const complementaryProducts = computed(() => {
  if (!product.value) return []
  return store.products
    .filter((item) => item.id !== product.value.id && item.category !== product.value.category)
    .slice(0, 3)
})

function addToCart() {
  if (!product.value) {
    return
  }

  store.addToCart(product.value.id, quantity.value, selectedColor.value)
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
