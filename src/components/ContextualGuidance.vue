<template>
  <aside
    v-if="context"
    class="contextual-guidance"
    :class="[`tone-${context.tone}`, { floating: floating }]"
    role="status"
    aria-live="polite"
  >
    <div class="contextual-guidance-copy">
      <p class="contextual-guidance-kicker">{{ kicker }}</p>
      <h3>{{ context.title }}</h3>
      <p>{{ context.message }}</p>
      <p v-if="context.helper" class="contextual-guidance-helper">{{ context.helper }}</p>
    </div>

    <div class="contextual-guidance-actions">
      <button
        v-if="showHighlight"
        type="button"
        class="button-soft button-sm"
        @click="highlightTarget"
      >
        {{ context.actionLabel || "Show me" }}
      </button>
      <button type="button" class="text-button" @click="dismiss">Dismiss</button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from "vue"
import { useProductStore } from "../stores/productStore"

const props = defineProps({
  contextId: {
    type: String,
    default: "",
  },
  floating: {
    type: Boolean,
    default: false,
  },
  showHighlight: {
    type: Boolean,
    default: true,
  },
})

const store = useProductStore()

const context = computed(() => {
  if (props.contextId) {
    return store.guidanceContexts.find((item) => item.id === props.contextId) ?? null
  }

  return store.activeGuidanceContext
})

const kicker = computed(() => {
  if (!context.value) {
    return "Tip"
  }

  const map = {
    tip: "Tip",
    assistant: "Assistant",
    "did-you-know": "Did you know?",
  }

  return map[context.value.tone] ?? "Tip"
})

function dismiss() {
  if (!context.value) {
    return
  }

  store.dismissContextualGuidance(context.value.id)
  store.clearHighlightTargets()
}

function highlightTarget() {
  if (!context.value?.target) {
    return
  }

  store.setHighlightTargets([context.value.target])
  window.setTimeout(() => {
    if (store.guidance?.highlightTargets?.includes(context.value.target)) {
      store.clearHighlightTargets()
    }
  }, 5000)
}

</script>

<style scoped>
.contextual-guidance {
  display: grid;
  gap: 14px;
  margin: 14px 0 0;
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid var(--panel-border);
  background: linear-gradient(180deg, rgba(255, 253, 249, 0.98), rgba(246, 242, 236, 0.94));
  box-shadow: 0 14px 32px rgba(35, 45, 68, 0.06);
}

.contextual-guidance.floating {
  margin-top: 18px;
}

.contextual-guidance-copy h3,
.contextual-guidance-copy p {
  margin: 0;
}

.contextual-guidance-copy {
  display: grid;
  gap: 8px;
}

.contextual-guidance-kicker {
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.74rem;
  font-weight: 800;
}

.contextual-guidance-helper {
  color: var(--muted);
}

.contextual-guidance-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.tone-did-you-know {
  border-color: rgba(92, 161, 143, 0.28);
}

.tone-assistant {
  border-color: rgba(35, 45, 68, 0.16);
}
</style>
