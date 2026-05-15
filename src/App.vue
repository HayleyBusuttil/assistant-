<template>
  <div class="app-shell">
    <div class="app-bg app-bg-a"></div>
    <div class="app-bg app-bg-b"></div>
    <Navbar />
    <AppToast />
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import AppToast from "./components/AppToast.vue"
import Navbar from "./components/Navbar.vue"
</script>
