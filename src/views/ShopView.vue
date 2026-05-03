<template>
  <section class="page page-shop refined-layout">
    <div v-if="store.toast" class="toast" :class="`toast-${store.toast.type}`">
      <span>{{ store.toast.message }}</span>
      <button type="button" @click="store.dismissToast()">×</button>
    </div>

    <header class="shop-hero">
      <div>
        <p class="eyebrow">Shop</p>
        <h1>Discover your next outfit.</h1>
        <p class="lead">
          Browse, filter, compare, and explore products designed for everyday wear.
        </p>
        <TooltipHint id="shop-entry-tip" text="Not sure where to start? Try our best sellers and featured picks." />
      </div>

      <div class="hero-stats">
        <span>{{ store.products.length }} items</span>
        <span>{{ store.categories.length - 1 }} categories</span>
        <span>{{ store.cartCount }} in cart</span>
      </div>
    </header>

    <section
      class="filters-bar"
      aria-label="Product filters"
      :class="{ 'highlighted-guidance': store.guidance?.highlightTargets?.includes('filters-bar') }"
    >
      <input
        v-model="search"
        type="search"
        placeholder="Search products..."
        class="search-input"
      />

      <select v-model="category" aria-label="Category">
        <option v-for="item in store.categories" :key="item" :value="item">
          {{ item }}
        </option>
      </select>

      <select v-model="collection" aria-label="Collection">
        <option v-for="item in availableCollections" :key="item" :value="item">
          {{ item }}
        </option>
      </select>

      <select v-model="sort" aria-label="Sort products">
        <option value="featured">Featured</option>
        <option value="newest">Newest</option>
        <option value="price-asc">Price ↑</option>
        <option value="price-desc">Price ↓</option>
      </select>

      <button type="button" @click="store.resetFilters()" class="reset-btn">
        Reset
      </button>
    </section>

    <section
      v-if="store.comparisonProducts.length"
      class="compare-tray"
      :class="{ 'highlighted-guidance': store.guidance?.highlightTargets?.includes('compare-tray') }"
    >
      <div>
        <p class="eyebrow">Compare</p>
        <h2>{{ store.comparisonProducts.length }}/2 products selected</h2>
      </div>

      <div class="compare-items">
        <article v-for="item in store.comparisonProducts" :key="item.id" class="compare-mini-card">
          <img :src="item.image" :alt="item.name" loading="lazy" decoding="async" />
          <div>
            <strong>{{ item.name }}</strong>
            <span>{{ item.category }} · €{{ item.price }}</span>
          </div>
          <button type="button" class="text-button" @click="store.toggleComparison(item.id)">
            Remove
          </button>
        </article>
      </div>

      <div v-if="store.comparisonProducts.length === 2" class="comparison-table">
        <div class="comparison-row header">
          <span>Feature</span>
          <strong v-for="item in store.comparisonProducts" :key="item.id">{{ item.name }}</strong>
        </div>
        <div class="comparison-row">
          <span>Price</span>
          <strong v-for="item in store.comparisonProducts" :key="item.id">€{{ item.price }}</strong>
        </div>
        <div class="comparison-row">
          <span>Rating</span>
          <strong v-for="item in store.comparisonProducts" :key="item.id">{{ item.rating.toFixed(1) }}/5</strong>
        </div>
        <div class="comparison-row">
          <span>Stock</span>
          <strong v-for="item in store.comparisonProducts" :key="item.id">{{ item.stock }} left</strong>
        </div>
      </div>

      <button type="button" class="button-soft button-sm" @click="store.clearComparison()">
        Clear comparison
      </button>
    </section>

    <section
      class="products-section recommendation-section"
      :class="{ 'highlighted-guidance': store.guidance?.highlightTargets?.includes('recommendation-section') }"
    >
      <div class="section-heading">
        <div>
          <p class="eyebrow">Featured results</p>
          <h2>{{ store.filteredProducts.length }} results</h2>
        </div>
        <p>Select up to two products to compare them before opening the product page.</p>
      </div>

      <div v-if="store.filteredProducts.length" class="product-grid">
        <ProductCard
          v-for="product in paginatedProducts"
          :key="product.id"
          v-memo="[product.id, store.comparison.includes(product.id), store.comparison.length >= 2]"
          :product="product"
          :is-compared="store.comparison.includes(product.id)"
          :compare-disabled="store.comparison.length >= 2"
          @quick-add="store.addToCart(product.id)"
          @compare="store.toggleComparison(product.id)"
        />
      </div>

      <div v-if="store.filteredProducts.length && totalPages > 1" class="pagination-bar" aria-label="Pagination">
        <p class="pagination-summary">Showing {{ pageStart }}-{{ pageEnd }} of {{ store.filteredProducts.length }}</p>

        <nav class="pagination-controls" aria-label="Shop page navigation">
          <button type="button" class="pagination-btn" :disabled="currentPage === 1" @click="previousPage">
            Previous
          </button>

          <button
            v-for="page in totalPages"
            :key="`page-${page}`"
            type="button"
            class="pagination-btn"
            :class="{ active: currentPage === page }"
            :aria-current="currentPage === page ? 'page' : undefined"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>

          <button type="button" class="pagination-btn" :disabled="currentPage === totalPages" @click="nextPage">
            Next
          </button>
        </nav>
      </div>

      <EmptyStateHelper v-else @reset="store.resetFilters()" @browse-popular="browsePopular" />
    </section>

    <RecommendationSection
      eyebrow="Get started"
      title="Not sure where to start? Try our best sellers"
      helper-text="Popular picks selected from current catalog performance"
      :products="bestSellers"
      :comparison="store.comparison"
      @quick-add="store.addToCart"
      @compare="store.toggleComparison"
    />

    <RecommendationSection
      eyebrow="Customers also viewed"
      title="Explore popular categories"
      helper-text="These suggestions help when you are still browsing options"
      :products="customersAlsoViewed"
      :comparison="store.comparison"
      @quick-add="store.addToCart"
      @compare="store.toggleComparison"
    />

    <AssistantPanel />
    <HelpPanel />
  </section>
</template>

<script setup>
import { computed, ref, watch } from "vue"
import { useProductStore } from "../stores/productStore"
import ProductCard from "../components/ProductCard.vue"
import HelpPanel from "../components/HelpPanel.vue"
import AssistantPanel from "../components/AssistantPanel.vue"
import RecommendationSection from "../components/RecommendationSection.vue"
import EmptyStateHelper from "../components/EmptyStateHelper.vue"
import TooltipHint from "../components/TooltipHint.vue"

const store = useProductStore()
const productsPerPage = 12
const currentPage = ref(1)

const search = ref(store.filters.search)
const category = ref(store.filters.category)
const collection = ref(store.filters.collection)
const sort = ref(store.filters.sort)

const availableCollections = computed(() => store.collections(category.value))
const bestSellers = computed(() => store.recommendedProducts(category.value).slice(0, 4))
const customersAlsoViewed = computed(() => store.recommendedProducts("All").slice(2, 6))

let timeout = null

watch(search, (value) => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    store.setSearch(value)
    currentPage.value = 1
  }, 300)
})

watch(category, (value) => {
  store.setCategory(value)
  currentPage.value = 1
})

watch(collection, (value) => {
  store.setCollection(value)
  currentPage.value = 1
})

watch(sort, (value) => {
  store.setSort(value)
  currentPage.value = 1
})

const totalPages = computed(() => Math.max(1, Math.ceil(store.filteredProducts.length / productsPerPage)))

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * productsPerPage
  return store.filteredProducts.slice(start, start + productsPerPage)
})

const pageStart = computed(() => {
  if (!store.filteredProducts.length) {
    return 0
  }

  return (currentPage.value - 1) * productsPerPage + 1
})

const pageEnd = computed(() => {
  return Math.min(currentPage.value * productsPerPage, store.filteredProducts.length)
})

const goToPage = (page) => {
  currentPage.value = page
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value -= 1
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1
  }
}

const browsePopular = () => {
  const firstPopular = store.categoryGroups[0]?.category ?? "All"
  store.setCategory(firstPopular)
  category.value = firstPopular
}

watch(
  () => store.filteredProducts.length,
  () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
  },
)
</script>

<style scoped>
/* keep empty - styles live in global style.css */
</style>

