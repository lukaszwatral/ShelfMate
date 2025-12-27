<template>
  <div
    class="d-flex align-items-center p-3 border-bottom bg-white entity-row"
    @click="$emit('click')"
  >
    <div
      class="icon-box me-3 d-flex align-items-center justify-content-center text-white shadow-sm"
      :style="{ backgroundColor: entity.color || '#adb5bd' }"
    >
      <i :class="['bi', entity.icon ? `bi-${entity.icon}` : getDefaultIcon(entity.type)]"></i>
    </div>

    <div class="flex-grow-1 overflow-hidden">
      <div class="d-flex justify-content-between">
        <h6 class="mb-0 text-truncate">{{ entity.name }}</h6>
        <span class="badge bg-light text-dark border">
          {{ getTypeName(entity.type) }}
        </span>
      </div>
      <small class="text-muted text-truncate d-block">
        {{ entity.description || '' }}
      </small>
    </div>

    <i class="bi bi-chevron-right text-muted ms-2"></i>
  </div>
</template>

<script>
import { trans } from '@/translations/translator.js';
export default {
  name: 'EntityListItem',
  props: {
    entity: { required: true, type: Object },
  },
  methods: {
    trans,
    getDefaultIcon(type) {
      if (type === 'place') return 'bi-box-seam-fill';
      if (type === 'category') return 'bi-tag-fill';
      return 'bi-bag-fill';
    },
    getTypeName(type) {
      if (type === 'place') return trans('place.title');
      if (type === 'category') return trans('category.title');
      return trans('item.title');
    },
  },
};
</script>

<style scoped>
.entity-row {
  cursor: pointer;
  transition: background 0.2s;
}
.entity-row:active {
  background: #f8f9fa !important;
}
.icon-box {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  font-size: 1.2rem;
  flex-shrink: 0;
}
</style>
