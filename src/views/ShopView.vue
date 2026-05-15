<template>
  <section class="page page-shop refined-layout">
    <header class="shop-hero">
      <div>
        <p class="eyebrow">Shop</p>
        <h1>Discover your next outfit.</h1>
        <p class="lead">
          Browse, filter, compare, and explore products designed for everyday wear.
        </p>
      </div>

      <div class="hero-stats">
        <span>{{ store.products.length }} items</span>
        <span>{{ store.categories.length - 1 }} categories</span>
        <span>{{ store.cartCount }} in cart</span>
      </div>
    </header>

    <section
      id="filters-bar"
      class="filters-bar"
      aria-label="Product filters"
      :class="{ 'highlighted-guidance': store.guidance?.highlightTargets?.includes('filters-bar') }"
    >
      <label class="input-group">
        <span>Search products</span>
        <input
          v-model="search"
          type="search"
          placeholder="Search products..."
          class="search-input"
        />
      </label>

      <label class="input-group">
        <span>Filter by category</span>
        <select v-model="category" aria-label="Category">
          <option v-for="item in store.categories" :key="item" :value="item">
            {{ item }}
          </option>
        </select>
      </label>

      <label class="input-group">
        <span>Filter by collection</span>
        <select v-model="collection" aria-label="Collection">
          <option v-for="item in availableCollections" :key="item" :value="item">
            {{ item }}
          </option>
        </select>
      </label>

      <label class="input-group">
        <span>Sort results</span>
        <select v-model="sort" aria-label="Sort products">
          <option value="featured">Featured</option>
          <option value="newest">Newest</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
        </select>
      </label>

      <button type="button" @click="store.resetFilters()" class="reset-btn">
        Reset
      </button>
    </section>

    <ContextualGuidance
      v-if="showFiltersGuidance"
      context-id="filters-entry"
    />

    <section
      v-if="store.comparisonProducts.length"
      id="comparison-section"
      ref="comparisonSection"
      class="compare-tray"
      :class="{ 'highlighted-guidance': store.guidance?.highlightTargets?.includes('compare-tray') }"
    >
      <div>
        <p class="eyebrow">Compare</p>
        <h2>{{ store.comparisonProducts.length }}/2 products selected</h2>
      </div>

      <div class="compare-items">
        <RouterLink
          v-for="item in store.comparisonProducts"
          :key="item.id"
          :to="`/product/${item.id}`"
          class="compare-mini-card"
        >
          <img :src="item.image" :alt="item.name" loading="lazy" decoding="async" />
          <div class="compare-mini-copy">
            <strong>{{ item.name }}</strong>
            <span>{{ item.category }} · €{{ item.price }}</span>
          </div>
          <div class="compare-mini-actions">
            <button type="button" class="button-ghost button-sm" @click.stop.prevent="store.addToCart(item.id)">
              Add to cart
            </button>
            <button type="button" class="button-ghost button-sm" @click.stop.prevent="store.toggleComparison(item.id)">
              Remove
            </button>
          </div>
        </RouterLink>
      </div>

      <div v-if="store.comparisonProducts.length === 2" class="comparison-table">
        <div class="comparison-row header">
          <span>Feature</span>
          <RouterLink
            v-for="item in store.comparisonProducts"
            :key="item.id"
            :to="`/product/${item.id}`"
            class="comparison-product-link"
          >
            {{ item.name }}
          </RouterLink>
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

      <ContextualGuidance
        v-if="store.activeGuidanceContext?.id === 'compare-active'"
        context-id="compare-active"
      />
    </section>

    <section
      id="recommendation-section"
      class="products-section recommendation-section"
      :class="{ 'highlighted-guidance': store.guidance?.highlightTargets?.includes('recommendation-section') }"
    >
      <div class="section-heading">
        <div>
          <p class="eyebrow">Browse results</p>
          <h2>{{ store.filteredProducts.length }} results</h2>
        </div>
        <p>The support rail below adapts as your browsing becomes more focused, more comparative, or more decision-oriented.</p>
      </div>

      <div class="discoverability-row">
        <span class="discoverability-pill" :class="{ emphasized: store.guidance?.highlightTargets?.includes('compare-button') }">
          Compare similar items
        </span>
        <span class="discoverability-pill" :class="{ emphasized: store.guidance?.highlightTargets?.includes('recommendation-section') }">
          Context-aware guidance
        </span>
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
      v-if="activeRecommendation"
      :eyebrow="activeRecommendation.eyebrow"
      :title="activeRecommendation.title"
      :helper-text="activeRecommendation.helperText"
      :product-label="activeRecommendation.label"
      :signals="activeRecommendation.signals ?? []"
      :products="activeRecommendation.products"
      :comparison="store.comparison"
      @quick-add="store.addToCart"
      @compare="store.toggleComparison"
    />

    <ContextualGuidance
      v-if="showRecommendationGuidance"
      :context-id="store.activeGuidanceContext?.id"
    />

    <AssistantPanel />
    <HelpPanel />
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useProductStore } from "../stores/productStore"
import ProductCard from "../components/ProductCard.vue"
import HelpPanel from "../components/HelpPanel.vue"
import AssistantPanel from "../components/AssistantPanel.vue"
import RecommendationSection from "../components/RecommendationSection.vue"
import EmptyStateHelper from "../components/EmptyStateHelper.vue"
import ContextualGuidance from "../components/ContextualGuidance.vue"

const store = useProductStore()
const productsPerPage = 12
const currentPage = ref(1)
const comparisonSection = ref(null)

const search = ref(store.filters.search)
const category = ref(store.filters.category)
const collection = ref(store.filters.collection)
const sort = ref(store.filters.sort)

const availableCollections = computed(() => store.collections(category.value))
const activeRecommendation = computed(() => store.activeRecommendation)
const showFiltersGuidance = computed(() =>
  ["landing-welcome", "filters-entry"].includes(store.activeGuidanceContext?.id ?? ""),
)
const showRecommendationGuidance = computed(() =>
  ["compare-entry", "recommendations-discovery", "undecided-nudge", "category-confidence", "discovery-nudge"].includes(
    store.activeGuidanceContext?.id ?? "",
  ),
)

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

watch(
  () => [store.filteredProducts.length, store.comparison.length, store.cartCount, store.recentlyViewed.length, activeRecommendation.value?.title],
  () => {
    store.maybeShowContextualGuidance([
      "landing-welcome",
      "discovery-nudge",
      "compare-active",
      "recommendations-discovery",
      "undecided-nudge",
      "category-confidence",
      "filters-entry",
    ])
  },
  { immediate: true },
)

watch(
  () => store.comparison.length,
  async (length, previousLength) => {
    if (length === 2 && previousLength !== 2) {
      await nextTick()
      comparisonSection.value?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  },
)

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

function handleShopScroll() {
  if (window.scrollY > 960) {
    store.markShopLongScroll()
    store.maybeShowContextualGuidance(["discovery-nudge"])
  }
}

onMounted(() => {
  window.addEventListener("scroll", handleShopScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleShopScroll)
})
</script>

<style scoped>
/* keep empty - styles live in global style.css */
</style>






