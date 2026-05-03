import { defineStore } from "pinia"

const storageKey = "guided-system-cart"
const compareStorageKey = "guided-system-compare"
const eventStorageKey = "guided-system-events"
const guidanceStorageKey = "guided-system-guidance"

const assetModules = import.meta.glob("../assets/**/*.jpg", {
  eager: true,
  import: "default",
})

const categoryLabels = {
  Dresses: "Dresses",
  Pants: "Pants",
  Shirts: "Shirts",
  Shoes: "Shoes",
}

const collectionLabels = {
  Dresses: "Dresses",
  MenPants: "Men Pants",
  WomanPants: "Women Pants",
  MenShirts: "Men Shirts",
  WomanShirts: "Women Shirts",
  running: "Running",
  maleDress: "Men Formal",
  womanDress: "Women Formal",
}

const categoryDescriptions = {
  Dresses: "Fluid, refined silhouettes with clean lines and an editorial finish.",
  Pants: "Tailored and relaxed separates for balanced everyday styling.",
  Shirts: "Crisp layers and polished essentials for versatile wardrobes.",
  Shoes: "From running pairs to formal styles, built for movement and presence.",
}

const badgePool = ["Featured", "New", "Editorial", "Signature", "Limited"]

const collectionColors = {
  Dresses: ["Ivory", "Sand", "Clay"],
  "Men Pants": ["Stone", "Charcoal", "Olive"],
  "Women Pants": ["Pearl", "Taupe", "Espresso"],
  "Men Shirts": ["White", "Sky", "Ink"],
  "Women Shirts": ["Cream", "Rose", "Slate"],
  Running: ["Cloud", "Graphite", "Mint"],
  "Men Formal": ["Black", "Walnut", "Navy"],
  "Women Formal": ["Bone", "Mocha", "Onyx"],
}

function humanize(value) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function loadJSON(key, fallback) {
  if (typeof window === "undefined") {
    return fallback
  }

  try {
    const saved = window.localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

function persistJSON(key, value) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

function parseProduct(path, image) {
  const segments = path.split("/")
  const assetsIndex = segments.indexOf("assets")
  const categoryKey = segments[assetsIndex + 1]
  const fileName = segments.at(-1) ?? "1.jpg"
  const imageNumber = Number(fileName.replace(/\.[^.]+$/, "")) || 1
  const maybeCollectionKey = segments[assetsIndex + 2]
  const hasNestedCollection = maybeCollectionKey && !/^\d+\.[^.]+$/.test(maybeCollectionKey)
  const collectionKey = hasNestedCollection ? maybeCollectionKey : categoryKey

  const category = categoryLabels[categoryKey] ?? humanize(categoryKey)
  const collection = collectionLabels[collectionKey] ?? humanize(collectionKey)
  const basePriceByCategory = {
    Dresses: 168,
    Pants: 118,
    Shirts: 92,
    Shoes: 138,
  }
  const collectionBoost = collection.includes("Women") ? 10 : collection.includes("Men") ? 14 : 8
  const price = basePriceByCategory[categoryKey] + imageNumber * 7 + collectionBoost
  const originalPrice = price + 28
  const shortName = `${collection} ${String(imageNumber).padStart(2, "0")}`
  const badge = badgePool[(imageNumber - 1) % badgePool.length]

  return {
    id: `${categoryKey}-${collectionKey}-${imageNumber}`,
    name: shortName,
    category,
    collection,
    badge,
    featured: imageNumber === 1,
    price,
    originalPrice,
    rating: Number((4.6 + (imageNumber % 4) * 0.1).toFixed(1)),
    reviews: 42 + imageNumber * 9,
    stock: 6 + ((imageNumber * 3) % 12),
    colors: collectionColors[collection] ?? ["Ivory", "Stone", "Ink"],
    image,
    summary: `${category} look ${imageNumber} from the ${collection.toLowerCase()} selection.`,
    description: `A clean ${category.toLowerCase()} piece from the ${collection.toLowerCase()} folder. Built for a balanced, editorial storefront presentation.`,
    details: [
      `${category} category`,
      `${collection} collection`,
      `${String(imageNumber).padStart(2, "0")} image in the series`,
    ],
  }
}

const products = Object.entries(assetModules)
  .map(([path, image]) => parseProduct(path, image))
  .sort((left, right) => {
    const categoryOrder = Object.keys(categoryLabels)
    const leftCategoryIndex = categoryOrder.indexOf(left.category)
    const rightCategoryIndex = categoryOrder.indexOf(right.category)

    if (leftCategoryIndex !== rightCategoryIndex) {
      return leftCategoryIndex - rightCategoryIndex
    }

    if (left.collection !== right.collection) {
      return left.collection.localeCompare(right.collection)
    }

    return left.name.localeCompare(right.name)
  })

export const useProductStore = defineStore("products", {
  state: () => ({
    products,
    filters: {
      search: "",
      category: "All",
      collection: "All",
      sort: "featured",
    },
    cart: loadJSON(storageKey, []),
    comparison: loadJSON(compareStorageKey, []),
    events: loadJSON(eventStorageKey, []),
    guidance: loadJSON(guidanceStorageKey, {
      enabled: false,
      level: "partial",
      highlightTargets: [],
      sequence: [],
      currentStep: 0,
      panelOpened: false,
    }),
    lastOrder: null,
    toast: null,
    seenTips: loadJSON("guided-system-seen-tips", {}),
    interactions: loadJSON("guided-system-interactions", {}),
  }),
  getters: {
    recommendedProducts: (state) => (category = null) => {
      // simple heuristic: Featured badge or high rating or same category
      const candidates = state.products.filter((p) => p.badge === "Featured" || p.rating >= 4.7)
      if (category) {
        return candidates.filter((p) => p.category === category).slice(0, 6)
      }

      return candidates.slice(0, 6)
    },
    productById: (state) => (id) => state.products.find((product) => product.id === String(id)),
    categories: (state) => ["All", ...new Set(state.products.map((product) => product.category))],
    collections: (state) => (category = "All") => {
      const scoped = category === "All" ? state.products : state.products.filter((product) => product.category === category)
      return ["All", ...new Set(scoped.map((product) => product.collection))]
    },
    featuredProducts: (state) => state.products.filter((product) => product.featured).slice(0, 4),
    categoryGroups: (state) =>
      state.categories
        .filter((category) => category !== "All")
        .map((category) => {
          const scoped = state.products.filter((product) => product.category === category)
          return {
            category,
            count: scoped.length,
            description: categoryDescriptions[category] ?? "Curated pieces organized for easy browsing.",
            image: scoped[0]?.image,
          }
        }),
    filteredProducts(state) {
      const search = state.filters.search.trim().toLowerCase()
      const category = state.filters.category
      const collection = state.filters.collection

      const matching = state.products.filter((product) => {
        const matchesSearch =
          !search ||
          [product.name, product.category, product.collection, product.summary, product.badge]
            .join(" ")
            .toLowerCase()
            .includes(search)
        const matchesCategory = category === "All" || product.category === category
        const matchesCollection = collection === "All" || product.collection === collection

        return matchesSearch && matchesCategory && matchesCollection
      })

      const sorters = {
        featured: (left, right) => Number(right.featured) - Number(left.featured),
        "price-asc": (left, right) => left.price - right.price,
        "price-desc": (left, right) => right.price - left.price,
        newest: (left, right) => right.name.localeCompare(left.name),
      }

      return matching.sort(sorters[state.filters.sort] ?? sorters.featured)
    },
    cartItems(state) {
      return state.cart
        .map((line) => {
          const product = state.products.find((item) => item.id === line.productId)

          if (!product) {
            return null
          }

          return {
            ...line,
            product,
            lineTotal: Number((product.price * line.quantity).toFixed(2)),
          }
        })
        .filter(Boolean)
    },
    cartCount(state) {
      return state.cart.reduce((count, line) => count + line.quantity, 0)
    },
    cartLineCount(state) {
      return state.cart.length
    },
    comparisonProducts(state) {
      return state.comparison
        .map((id) => state.products.find((product) => product.id === id))
        .filter(Boolean)
    },
    subtotal() {
      return Number(this.cartItems.reduce((sum, line) => sum + line.lineTotal, 0).toFixed(2))
    },
    shipping() {
      return this.cartItems.length === 0 ? 0 : this.subtotal >= 180 ? 0 : 14
    },
    tax() {
      return Number((this.subtotal * 0.12).toFixed(2))
    },
    total() {
      return Number((this.subtotal + this.shipping + this.tax).toFixed(2))
    },
    guidanceSuggestion(state) {
      if (!state.guidance?.enabled) return null

      const cartCount = state.cart.reduce((c, l) => c + l.quantity, 0)
      if (cartCount === 0 && !state.filters.search) {
        const firstCategory = state.products?.[0]?.category ?? "our collection"
        return `Try browsing featured items in ${firstCategory} or use the filters to narrow styles.`
      }

      if (cartCount > 0) {
        return "You have items in your cart — consider comparing similar styles or view the cart to checkout."
      }

      if (state.filters.category !== "All") {
        return `Explore collections within ${state.filters.category} to find complementary pieces.`
      }

      return "Browse the curated selections or use search to hone in on a style."
    },
    assistantStepLabel(state) {
      const steps = state.guidance?.sequence ?? []
      const index = Number(state.guidance?.currentStep ?? 0)
      return steps[index]?.label ?? null
    },
  },
  actions: {
    setSearch(search) {
      this.filters.search = search
    },
    setCategory(category) {
      this.filters.category = category
      if (category === "All") {
        this.filters.collection = "All"
        return
      }

      const allowedCollections = this.collections(category)
      if (!allowedCollections.includes(this.filters.collection)) {
        this.filters.collection = "All"
      }
    },
    setCollection(collection) {
      this.filters.collection = collection
    },
    setSort(sort) {
      this.filters.sort = sort
    },
    resetFilters() {
      this.filters.search = ""
      this.filters.category = "All"
      this.filters.collection = "All"
      this.filters.sort = "featured"
      this.showToast("Filters reset")
    },
    showToast(message, type = "success") {
      this.toast = { message, type, id: Date.now() }
    },
    dismissToast() {
      this.toast = null
    },
    trackEvent(name, payload = {}) {
      const event = {
        name,
        payload,
        createdAt: new Date().toISOString(),
      }

      this.events.push(event)
      persistJSON(eventStorageKey, this.events.slice(-80))
    },
    addToCart(productId, quantity = 1, color = null) {
      const product = this.products.find((item) => item.id === productId)

      if (!product) {
        return
      }

      const chosenColor = color ?? product.colors[0]
      const existingLine = this.cart.find(
        (line) => line.productId === productId && line.color === chosenColor,
      )

      if (existingLine) {
        existingLine.quantity += quantity
      } else {
        this.cart.push({ productId, quantity, color: chosenColor })
      }

      persistJSON(storageKey, this.cart)
      this.trackEvent("add_to_cart", { productId, quantity, color: chosenColor })
      this.showToast(`${product.name} added to cart`)
    },
    updateCartQuantity(productId, color, quantity) {
      const existingLine = this.cart.find(
        (line) => line.productId === productId && line.color === color,
      )

      if (!existingLine) {
        return
      }

      if (quantity <= 0) {
        this.removeFromCart(productId, color)
        return
      }

      existingLine.quantity = quantity
      persistJSON(storageKey, this.cart)
      this.trackEvent("update_cart_quantity", { productId, color, quantity })
    },
    removeFromCart(productId, color) {
      this.cart = this.cart.filter(
        (line) => !(line.productId === productId && line.color === color),
      )
      persistJSON(storageKey, this.cart)
      this.trackEvent("remove_from_cart", { productId, color })
      this.showToast("Item removed from cart", "neutral")
    },
    clearCart() {
      this.cart = []
      persistJSON(storageKey, this.cart)
    },
    toggleComparison(productId) {
      const product = this.products.find((item) => item.id === productId)

      if (!product) {
        return
      }

      if (this.comparison.includes(productId)) {
        this.comparison = this.comparison.filter((id) => id !== productId)
        this.showToast(`${product.name} removed from comparison`, "neutral")
      } else if (this.comparison.length < 2) {
        this.comparison.push(productId)
        this.showToast(`${product.name} added to comparison`)
      } else {
        this.showToast("Compare is limited to 2 products", "warning")
        return
      }

      persistJSON(compareStorageKey, this.comparison)
      this.trackEvent("toggle_compare", { productId, selected: this.comparison.includes(productId) })
    },
    clearComparison() {
      this.comparison = []
      persistJSON(compareStorageKey, this.comparison)
      this.showToast("Comparison cleared", "neutral")
    },
    completeCheckout(payload) {
      const orderTotal = Number((payload?.total ?? this.total).toFixed(2))
      const order = {
        id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        placedAt: new Date().toISOString(),
        ...payload,
        items: this.cartItems.map((line) => ({
          name: line.product.name,
          quantity: line.quantity,
          color: line.color,
          price: line.product.price,
        })),
        total: orderTotal,
      }

      this.lastOrder = order
      this.trackEvent("checkout_complete", {
        orderId: order.id,
        total: order.total,
        items: order.items.length,
        shippingMethod: payload?.shippingMethod,
      })
      this.clearCart()
      this.showToast("Simulated order placed")

      return order
    },
    toggleGuidance() {
      this.guidance = {
        ...(this.guidance || {}),
        enabled: !Boolean(this.guidance?.enabled),
        panelOpened: !Boolean(this.guidance?.enabled),
      }
      persistJSON(guidanceStorageKey, this.guidance)
      this.trackEvent("toggle_guidance", { enabled: this.guidance.enabled })
      this.showToast(this.guidance.enabled ? "Guidance enabled" : "Guidance disabled", "neutral")
    },
    openAssistantPanel() {
      this.guidance = { ...(this.guidance || {}), enabled: true, panelOpened: true }
      persistJSON(guidanceStorageKey, this.guidance)
      this.trackEvent("open_assistant_panel")
    },
    closeAssistantPanel() {
      this.guidance = {
        ...(this.guidance || {}),
        enabled: false,
        panelOpened: true,
        sequence: [],
        currentStep: 0,
        highlightTargets: [],
      }
      persistJSON(guidanceStorageKey, this.guidance)
      this.trackEvent("close_assistant_panel")
    },
    setGuidanceLevel(level) {
      this.guidance = { ...(this.guidance || {}), level }
      persistJSON(guidanceStorageKey, this.guidance)
      this.trackEvent("set_guidance_level", { level })
    },
    setHighlightTargets(targets = []) {
      this.guidance = { ...(this.guidance || {}), highlightTargets: targets }
      persistJSON(guidanceStorageKey, this.guidance)
      this.trackEvent("set_highlight_targets", { targets })
    },
    clearHighlightTargets() {
      this.guidance = { ...(this.guidance || {}), highlightTargets: [] }
      persistJSON(guidanceStorageKey, this.guidance)
      this.trackEvent("clear_highlight_targets")
    },
    startSequence(sequence = []) {
      if (!Array.isArray(sequence) || sequence.length === 0) return
      this.guidance = { ...(this.guidance || {}), sequence, currentStep: 0, enabled: true }
      const first = sequence[0]
      this.guidance.highlightTargets = first?.target ? [first.target] : []
      persistJSON(guidanceStorageKey, this.guidance)
      this.trackEvent("start_sequence", { sequence })
    },
    advanceSequence() {
      const seq = this.guidance?.sequence || []
      let idx = Number(this.guidance?.currentStep ?? 0)
      idx += 1
      if (idx >= seq.length) {
        this.endSequence()
        return
      }
      this.guidance.currentStep = idx
      const next = seq[idx]
      this.guidance.highlightTargets = next?.target ? [next.target] : []
      persistJSON(guidanceStorageKey, this.guidance)
      this.trackEvent("advance_sequence", { to: idx })
    },
    previousSequence() {
      const seq = this.guidance?.sequence || []
      let idx = Number(this.guidance?.currentStep ?? 0)
      idx = Math.max(0, idx - 1)
      this.guidance.currentStep = idx
      const cur = seq[idx]
      this.guidance.highlightTargets = cur?.target ? [cur.target] : []
      persistJSON(guidanceStorageKey, this.guidance)
      this.trackEvent("previous_sequence", { to: idx })
    },
    goToStep(index) {
      const seq = this.guidance?.sequence || []
      const idx = Math.max(0, Math.min(seq.length - 1, Number(index)))
      this.guidance.currentStep = idx
      const cur = seq[idx]
      this.guidance.highlightTargets = cur?.target ? [cur.target] : []
      persistJSON(guidanceStorageKey, this.guidance)
      this.trackEvent("go_to_step", { to: idx })
    },
    endSequence() {
      this.guidance = { ...(this.guidance || {}), sequence: [], currentStep: 0, highlightTargets: [] }
      persistJSON(guidanceStorageKey, this.guidance)
      this.trackEvent("end_sequence")
    },
    dismissTip(tipId) {
      this.seenTips = { ...(this.seenTips || {}), [tipId]: true }
      persistJSON("guided-system-seen-tips", this.seenTips)
      this.trackEvent("dismiss_tip", { tipId })
    },
    hasSeenTip(tipId) {
      return Boolean(this.seenTips?.[tipId])
    },
    trackInteraction(name, payload = {}) {
      const now = new Date().toISOString()
      this.interactions = { ...(this.interactions || {}), [now]: { name, payload } }
      persistJSON("guided-system-interactions", this.interactions)
      this.trackEvent("interaction", { name, payload })
    },
  },
})
