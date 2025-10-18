<template>
  <li class="entity-item" :class="{ active: entity.active }">
    <div class="entity-row">
      <slot name="entity" :entity="entity">
        <i v-if="entity.type === 'category'" class="bi bi-tag-fill entity-icon"></i>
        <i v-else-if="entity.type === 'place'" class="bi-box-seam-fill entity-icon"></i>
        <i v-else-if="entity.type === 'item'" class="bi-bag-fill entity-icon"></i>
        <span class="entity-name">{{ entity.name }}</span>
        <span class="entity-description">{{ entity.description }}</span>
      </slot>
      <button
        v-if="entity.children && entity.children.length"
        class="toggle-btn"
        type="button"
        @click="toggle"
        aria-label="toggle children"
      >
        <span></span>
        <i v-if="expanded" class="bi-chevron-up"></i>
        <i v-else class="bi-chevron-down"></i>
      </button>
    </div>
  </li>
  <transition name="slide-fade">
    <ul v-if="entity.children && entity.children.length && expanded" class="children-list">
      <EntityTree v-for="child in entity.children" :key="child.id" :entity="child">
        <template #entity="slotProps">
          <slot name="entity" v-bind="slotProps" />
        </template>
      </EntityTree>
    </ul>
  </transition>
</template>

<script setup>
import { ref } from 'vue'

defineOptions({
  name: 'EntityTree',
})

const props = defineProps({
  entity: { type: Object, required: true },
})

const expanded = ref(false)

const toggle = () => {
  expanded.value = !expanded.value
}
</script>

<style scoped>
.children-list {
  padding-left: 20px;
  list-style: none;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition:
    max-height 0.3s ease-in-out,
    opacity 0.3s ease-in-out;
  overflow: hidden;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  max-height: 0;
  opacity: 0;
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  max-height: 1000px; /* Adjust if needed for deeply nested content */
  opacity: 1;
}
</style>
