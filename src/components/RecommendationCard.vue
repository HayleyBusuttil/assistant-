<template>
  <component
    :is="to ? RouterLink : 'button'"
    class="recommendation-card"
    :to="to"
    type="button"
    @click="!to ? emit('activate') : undefined"
  >
    <span class="recommendation-card-icon" aria-hidden="true">{{ iconGlyph }}</span>

    <div class="recommendation-card-copy">
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
    </div>

    <span class="recommendation-card-cta">
      {{ ctaLabel }}
    </span>
  </component>
</template>

<script setup>
import { computed } from "vue"
import { RouterLink } from "vue-router"

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: "spark" },
  ctaLabel: { type: String, default: "Open" },
  to: { type: String, default: "" },
})

const emit = defineEmits(["activate"])

const iconGlyph = computed(() => {
  const icons = {
    categories: "◎",
    filter: "◇",
    compare: "⇄",
    pair: "+",
    checkout: "→",
    spark: "•",
  }

  return icons[props.icon] ?? icons.spark
})
</script>

<style scoped>
.recommendation-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  width: 100%;
  min-height: 88px;
  padding: 14px 15px;
  border: 1px solid rgba(47, 79, 103, 0.14);
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255, 253, 249, 0.98), rgba(247, 243, 236, 0.92));
  box-shadow: 0 10px 22px rgba(28, 49, 74, 0.06);
  text-align: left;
  cursor: pointer;
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.recommendation-card:hover {
  transform: translateY(-2px);
  border-color: rgba(47, 79, 103, 0.28);
  box-shadow: 0 14px 28px rgba(28, 49, 74, 0.08);
}

.recommendation-card-icon {
  width: 34px;
  height: 34px;
  display: inline-grid;
  place-items: center;
  border-radius: 999px;
  background: rgba(47, 79, 103, 0.08);
  color: var(--accent);
  font-size: 0.95rem;
  font-weight: 700;
}

.recommendation-card-copy h3,
.recommendation-card-copy p {
  margin: 0;
}

.recommendation-card-copy {
  display: grid;
  gap: 6px;
}

.recommendation-card-copy h3 {
  color: var(--heading);
  font-size: 0.96rem;
}

.recommendation-card-copy p {
  color: var(--muted);
  line-height: 1.35;
  font-size: 0.92rem;
}

.recommendation-card-cta {
  color: var(--accent);
  font-size: 0.82rem;
  font-weight: 700;
}
</style>
