<template>
  <nav class="nav-bar">
    <div class="nav-zone nav-zone-left">
      <RouterLink class="brand" to="/">AURA</RouterLink>
    </div>

    <div class="nav-zone nav-zone-center">
      <ul class="nav-links">
        <li>
          <RouterLink to="/" class="nav-link">Home</RouterLink>
        </li>
        <li>
          <RouterLink to="/shop" class="nav-link">Shop</RouterLink>
        </li>
        <li>
          <RouterLink to="/about" class="nav-link">About</RouterLink>
        </li>
        <li>
          <RouterLink to="/cart" class="nav-link nav-cart">
            Cart
            <span class="nav-cart-count">{{ store.cartCount }}</span>
          </RouterLink>
        </li>
      </ul>
    </div>

    <div class="nav-zone nav-zone-right">
      <p class="nav-status">
        {{ store.guidance?.enabled ? "Guidance on" : "Guidance off" }}
      </p>
      <button
        type="button"
        class="guidance-toggle"
        :class="{ active: store.guidance?.enabled }"
        :aria-pressed="store.guidance?.enabled ? 'true' : 'false'"
        :aria-label="store.guidance?.enabled ? 'Turn guidance off' : 'Turn guidance on'"
        @click="store.toggleGuidance()"
      >
        <span class="guidance-toggle-track">
          <span class="guidance-toggle-thumb"></span>
        </span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useProductStore } from "../stores/productStore"

const store = useProductStore()
</script>
