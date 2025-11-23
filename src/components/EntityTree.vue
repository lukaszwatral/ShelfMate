<template>
  <li
    class="entity-item shadow-sm"
    :class="{ active: entity.active, nested: depth > 0 }"
    :style="{ width: 100 - depth * 2 + '%', minWidth: 80 + '%' }"
  >
    <div class="entity-row">
      <slot name="entity" :entity="entity" :depth="depth">
        <i v-if="entity.icon" :class="`bi-bi-${entity.icon} entity-icon`"></i>
        <i v-else-if="entity.type === 'category'" class="bi bi-tag-fill entity-icon"></i>
        <i v-else-if="entity.type === 'place'" class="bi-box-seam-fill entity-icon"></i>
        <i v-else-if="entity.type === 'item'" class="bi-bag-fill entity-icon"></i>
        <span class="entity-name">{{ entity.name }}</span>
        <span class="entity-description">{{ entity.description }}</span>
      </slot>
      <div class="entity-actions">
        <button><i class="bi bi-pencil-square icon-small"></i></button>
        <button @click="toggleRemoveAction(entity)">
          <i class="bi bi-trash-fill icon-small"></i>
        </button>
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
    </div>
  </li>
  <transition name="slide-fade">
    <ul v-if="entity.children && entity.children.length && expanded" class="children-list">
      <EntityTree
        v-for="child in entity.children"
        :key="child.id"
        :entity="child"
        :depth="depth + 1"
      >
        <template #entity="slotProps">
          <slot name="entity" v-bind="slotProps" />
        </template>
      </EntityTree>
    </ul>
  </transition>
</template>
<script>
import { trans } from '@/translations/translator.js';
import { Dialog } from '@capacitor/dialog';
import { entityRepository } from '@/db/index.js';

export default {
  name: 'EntityTree',
  emits: ['removeEntity'],
  props: {
    entity: {
      type: Object,
      required: true,
    },
    depth: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      expanded: false,
    };
  },
  methods: {
    trans,
    toggle() {
      this.expanded = !this.expanded;
    },
    async toggleRemoveAction(entity) {
      const i18n = this.$.appContext.provides.i18n;
      const { value } = await Dialog.confirm({
        title: trans('removeEntity.alertTitle', { entity: entity.name }, i18n),
        message: trans('removeEntity.alertMessage', { entity: entity.name }, i18n),
      });
      if (value) {
        await entityRepository.remove(entity);
        this.$emit('removeEntity');
      }
    },
  },
};
</script>

<style scoped>
.children-list {
  padding-left: 20px;
  list-style: none;
}

.nested {
  margin: 0 !important;
}
</style>
