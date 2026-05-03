<template>
  <div class="empty-state-helper">
    <h3>No products found</h3>
    <p>Try removing one filter or explore a different category.</p>

    <div class="empty-actions">
      <button class="button-soft button-sm" type="button" @click="emit('reset')">Reset filters</button>
      <button class="button button-sm" type="button" @click="emit('browse-popular')">Explore popular categories</button>
    </div>

    <ul class="empty-tips">
      <li>Tip: Start with best sellers if you are unsure where to begin.</li>
      <li>Tip: Keep category set to "All" first, then narrow down.</li>
    </ul>
  </div>
</template>

<script setup>
const emit = defineEmits(["reset", "browse-popular"])
</script>

<style scoped>
.empty-state-helper {
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  padding: 18px;
  background: linear-gradient(180deg, var(--panel), var(--panel-strong));
}

.empty-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 12px;
}

.empty-tips {
  color: var(--muted);
  margin: 14px 0 0;
  padding-left: 18px;
}
</style>
