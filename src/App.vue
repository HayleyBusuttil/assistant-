<template>
  <div class="app-shell">
    <div class="app-bg app-bg-a"></div>
    <div class="app-bg app-bg-b"></div>
    <Navbar />
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Navbar from "./components/Navbar.vue"
</script>