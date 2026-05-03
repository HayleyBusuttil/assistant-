<template>
  <nav class="nav-bar">
    <RouterLink class="brand" to="/">AURA</RouterLink>

    <div class="nav-links">
      <RouterLink to="/" class="nav-link">Home</RouterLink>
      <RouterLink to="/shop" class="nav-link">Shop</RouterLink>
      <RouterLink to="/about" class="nav-link">About</RouterLink>
      <RouterLink to="/cart" class="nav-link nav-cart">
        Cart
        <span class="nav-cart-count">{{ store.cartCount }}</span>
      </RouterLink>
      <div class="guidance-controls">
        <button type="button" class="text-button" @click="store.toggleGuidance()">
          {{ store.guidance?.enabled ? 'Guidance: On' : 'Guidance: Off' }}
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useProductStore } from "../stores/productStore"

const store = useProductStore()
</script>