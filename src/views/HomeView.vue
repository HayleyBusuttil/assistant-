<template>
  <section class="page page-home">
    <header class="hero-editorial">
      <img
        class="hero-editorial-image"
        src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=80"
        alt="Model wearing a neutral tailored coat"
        loading="eager"
        decoding="async"
        fetchpriority="high"
      />
      <div class="hero-editorial-overlay"></div>

      <div class="hero-editorial-content">
        <p class="hero-kicker">Spring / Summer 2026</p>
        <h1>Minimal Style.<br />Maximum Presence.</h1>
        <RouterLink class="button button-editorial" to="/shop">Shop Collection</RouterLink>
      </div>
    </header>

    <section class="section-block">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Featured edit</p>
          <h2>Modern essentials in neutral tones.</h2>
        </div>
        <RouterLink class="text-link" to="/shop">View all pieces</RouterLink>
      </div>

      <div class="product-grid featured-grid">
        <ProductCard
          v-for="product in store.featuredProducts"
          :key="product.id"
          :product="product"
          @quick-add="store.addToCart(product.id)"
        />
      </div>
    </section>

    <section class="section-block value-grid">
      <article class="detail-card accent-card">
        <p class="eyebrow">Crafted navigation</p>
        <h3>Browse intuitively, from edit to product page.</h3>
        <p>Every card leads to a focused product detail view with color and quantity selection.</p>
      </article>
      <article class="detail-card accent-card">
        <p class="eyebrow">Elevated shopping</p>
        <h3>Clean filtering and elegant product browsing.</h3>
        <p>Search, category filters, and sort controls help customers discover items quickly.</p>
      </article>
      <article class="detail-card accent-card">
        <p class="eyebrow">Checkout flow</p>
        <h3>Confident cart and seamless confirmation.</h3>
        <p>The simulated checkout keeps the experience coherent from first click to order summary.</p>
      </article>
    </section>
  </section>
</template>

<script setup>
import { useProductStore } from "../stores/productStore"
import ProductCard from "../components/ProductCard.vue"

const store = useProductStore()
</script>
