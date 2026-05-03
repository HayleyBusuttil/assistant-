<template>
  <section class="page page-about refined-layout">

    <!-- HERO -->
    <header class="about-hero split">
      <div class="about-copy">
        <p class="eyebrow">About {{ brandName }}</p>
        <h1>Effortless style, built for real-life wardrobes.</h1>
        <p class="lead">
          {{ brandName }} is designed as a clean, focused shopping experience where users can
          quickly explore, compare, and build outfits across essential categories.
        </p>
      </div>

    </header>

    <!-- STORY -->
    <section class="about-story grid-2">
      <article>
        <p class="eyebrow">Our approach</p>
        <h2>Clarity over clutter.</h2>
        <p>
          The interface is intentionally minimal to support fast decision-making and reduce
          unnecessary cognitive load during browsing.
        </p>
      </article>

      <article>
        <p class="eyebrow">Collection</p>
        <h2>Built around real outfits.</h2>
        <p>
          Each category supports mix-and-match styling, allowing users to build complete looks
          rather than isolated purchases.
        </p>
      </article>
    </section>

    <!-- FEATURES -->
    <section class="about-features grid-3">
      <div class="feature">
        <h3>Focused categories</h3>
        <p>Dresses, pants, shirts, and shoes form the foundation of the store.</p>
      </div>

      <div class="feature">
        <h3>Visual-first browsing</h3>
        <p>Large imagery helps users compare items quickly and confidently.</p>
      </div>

      <div class="feature">
        <h3>Simple navigation</h3>
        <p>Clear structure reduces friction and improves usability.</p>
      </div>
    </section>

    <!-- CATEGORY LIST -->
    <section class="category-focus">
      <div class="section-heading">
        <h2>Explore categories</h2>
      </div>

      <div class="category-grid">
        <article
          v-for="group in store.categoryGroups"
          :key="group.category"
          class="category-card"
        >
          <img v-if="group.image" :src="group.image" :alt="group.category" loading="lazy" decoding="async" />
          <div>
            <h3>{{ group.category }}</h3>
            <p>{{ group.description }}</p>
            <span>{{ group.count }} items</span>
          </div>
        </article>
      </div>
    </section>

  </section>
</template>

<script setup>
import { useProductStore } from "../stores/productStore"

const store = useProductStore()
const brandName = "UXShopLab"
</script>