<template>
  <aside v-if="store.guidance?.enabled" class="assistant-panel" role="region" aria-live="polite">
    <header class="assistant-header">
      <div>
        <p class="eyebrow">Assistant</p>
        <h3>{{ panelTitle }}</h3>
      </div>
      <button class="text-button" type="button" @click="closePanel">Close</button>
    </header>

    <div class="assistant-copy">
      <p>{{ message }}</p>
    </div>

    <div v-if="assistantCards.length" class="assistant-recommendations" aria-label="Assistant recommendations">
      <RecommendationCard
        v-for="card in assistantCards"
        :key="`${route.path}-${card.title}`"
        :title="card.title"
        :description="card.description"
        :icon="card.icon"
        :cta-label="card.ctaLabel"
        @activate="handleCard(card.action)"
      />
    </div>
  </aside>
</template>

<script setup>
import { computed } from "vue"
import { useRoute } from "vue-router"
import { useProductStore } from "../stores/productStore"
import RecommendationCard from "./RecommendationCard.vue"

const store = useProductStore()
const route = useRoute()
const panelTitle = computed(() => {
  if (route.path === "/") {
    return "Shopping guidance"
  }

  if (route.path === "/shop") {
    return "Browse with confidence"
  }

  if (route.path.startsWith("/product/")) {
    return "Choose your options"
  }

  if (route.path === "/cart") {
    return "Complete your checkout"
  }

  return "Shopping guidance"
})

const message = computed(() => {
  if (route.path === "/") {
    return "Start here to explore recommended products, narrow the selection with filters, and compare items before opening a product."
  }

  if (route.path === "/shop") {
    return "Use search, filters, and comparison tools to narrow the product list and find the items that fit your needs more quickly."
  }

  if (route.path.startsWith("/product/")) {
    return "Review the product details, choose your color, size, and quantity, then add the item to your cart when you are ready."
  }

  if (route.path === "/cart") {
    return "Review your items, confirm quantities, complete the delivery and payment fields, and move through checkout to place the order."
  }

  return store.shopAssistantMessage
})
const assistantCards = computed(() => {
  if (route.path === "/shop") {
    const cards = []

    if (store.filteredProducts.length > 8) {
      cards.push({
        title: "Too many choices?",
        description: "Try narrowing results using filters.",
        icon: "filter",
        ctaLabel: "Focus filters",
        action: "assistant-filters",
      })
    }

    if (store.comparisonProducts.length || store.recentlyViewed.length >= 2) {
      cards.push({
        title: "Compare similar styles",
        description: "View related products before making your decision.",
        icon: "compare",
        ctaLabel: "Open comparison",
        action: "assistant-compare",
      })
    }

    return cards
  }

  if (route.path.startsWith("/product/")) {
    const cards = []

    if (document.getElementById("similar-products-section")) {
      cards.push({
        title: "Compare similar styles",
        description: "View related products before making your decision.",
        icon: "compare",
        ctaLabel: "See similar products",
        action: "assistant-similar-products",
      })
    }

    const productId = String(route.params.id ?? "")
    const inCart = store.cart.some((line) => line.productId === productId)
    if (inCart && document.getElementById("complete-look-section")) {
      cards.push({
        title: "Complete the look",
        description: "Discover matching items for your selection.",
        icon: "pair",
        ctaLabel: "View matching items",
        action: "assistant-complete-look",
      })
    }

    return cards
  }

  if (route.path === "/cart" && store.cartItems.length) {
    return [
      {
        title: "Ready to checkout?",
        description: "You're only one step away.",
        icon: "checkout",
        ctaLabel: "Go to checkout",
        action: "assistant-checkout",
      },
    ]
  }

  return []
})

function closePanel() {
  store.closeAssistantPanel()
}

function handleCard(action) {
  const actionMap = {
    "assistant-filters": "filters-bar",
    "assistant-compare": store.comparisonProducts.length ? "comparison-section" : "recommendation-section",
    "assistant-similar-products": "similar-products-section",
    "assistant-complete-look": "complete-look-section",
    "assistant-checkout": "checkout-flow",
  }

  const highlightMap = {
    "assistant-filters": "filters-bar",
    "assistant-compare": store.comparisonProducts.length ? "compare-tray" : "compare-button",
    "assistant-similar-products": "recommendation-section",
    "assistant-complete-look": "recommendation-section",
    "assistant-checkout": "checkout-panel",
  }

  const target = actionMap[action]
  if (!target) {
    return
  }

  document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" })

  if (action === "assistant-filters") {
    window.setTimeout(() => {
      document.querySelector("#filters-bar input, #filters-bar select")?.focus()
    }, 250)
  }

  const highlight = highlightMap[action]
  if (!highlight) {
    return
  }

  store.setHighlightTargets([highlight])
  window.setTimeout(() => {
    if (store.guidance?.highlightTargets?.includes(highlight)) {
      store.clearHighlightTargets()
    }
  }, 5000)
}
</script>

<style scoped>
.assistant-panel {
  position: fixed;
  right: 20px;
  bottom: 22px;
  width: min(360px, calc(100% - 32px));
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
}

.assistant-recommendations {
  margin-top: 12px;
  display: grid;
  gap: 10px;
}
</style>
