<template>
  <li
    class="entity-item"
    :class="{ active: entity.active, nested: depth > 0, 'shadow-sm': view === 'list' }"
    :style="{ width: 100 - depth * 2 + '%', minWidth: 80 + '%', backgroundColor: entity.color }"
    @click="redirectToView"
  >
    <div :class="{ 'entity-row': view === 'list', 'entity-row-folder': view === 'folder' }">
      <slot name="entity" :entity="entity" :depth="depth">
        <i :class="getIconClass(entity)"></i>
        <span class="entity-name">{{ entity.name }}</span>
        <span class="entity-description">{{ entity.description }}</span>
      </slot>
      <div class="entity-actions">
        <button @click.stop.prevent="redirectToEdit">
          <i class="bi bi-pencil-square icon-small"></i>
        </button>

        <button @click.stop.prevent="toggleRemoveAction(entity)">
          <i class="bi bi-trash-fill icon-small"></i>
        </button>
        <button
          v-if="entity.children && entity.children.length"
          class="toggle-btn"
          type="button"
          :aria-label="view === 'list' ? 'toggle children' : 'enter folder'"
          @click.stop.prevent="view === 'list' ? toggle() : $emit('enter', entity)"
        >
          <span></span>
          <template v-if="view === 'list'">
            <i v-if="expanded" class="bi-chevron-up"></i>
            <i v-else class="bi-chevron-down"></i>
          </template>
          <template v-else>
            <i class="bi-chevron-right icon-small"></i>
          </template>
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
        :view="view"
        @removeEntity="$emit('removeEntity')"
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
import { Toast } from '@capacitor/toast';

export default {
  name: 'EntityTree',
  emits: ['removeEntity', 'edit', 'enter'],
  props: {
    entity: { type: Object, required: true },
    depth: { type: Number, default: 0 },
    view: { type: String, default: 'list' },
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
    getIconClass(entity) {
      if (entity.icon) return `bi bi-${entity.icon} entity-icon`;
      switch (entity.type) {
        case 'category':
          return 'bi bi-tag-fill entity-icon';
        case 'place':
          return 'bi bi-box-seam-fill entity-icon';
        case 'item':
          return 'bi bi-bag-fill entity-icon';
        default:
          return 'bi bi-question-circle entity-icon';
      }
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
        await Toast.show({
          text: trans('addEntity.entityRemoved', {}, this.$.appContext.provides.i18n),
          duration: 'long',
        });
      }
    },
    redirectToView() {
      this.$router.push({ name: 'viewEntity', params: { id: this.entity.id } });
    },
    redirectToEdit() {
      this.$router.push({ name: 'editEntity', params: { id: this.entity.id } });
    },
  },
};
</script>

<style scoped></style>
