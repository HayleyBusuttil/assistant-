<template>
  <nav class="nav-bar">
    <RouterLink class="brand" to="/">AURA</RouterLink>

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
      <li class="guidance-controls">
        <button type="button" class="text-button" @click="store.toggleGuidance()">
          {{ store.guidance?.enabled ? 'Guidance: On' : 'Guidance: Off' }}
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { useProductStore } from "../stores/productStore"

const store = useProductStore()
</script>
