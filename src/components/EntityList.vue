<template>
  <div class="entity-list mt-3">
    <ul v-if="rows.length" class="list-unstyled">
      <EntityTree v-for="row in rows" :key="row.id" :entity="row" @removeEntity="loadRows">
        <template #entity="{ entity }">
          <template v-if="entity.icon">
            <i :class="`bi bi-${entity.icon} entity-icon`"></i>
            <span class="entity-name">{{ entity.name }}</span>
            <span class="entity-description">{{ entity.description }}</span>
          </template>
          <template v-else-if="entity.type === 'category'">
            <i class="bi bi-tag-fill entity-icon"></i>
            <span class="entity-name">{{ entity.name }}</span>
            <span class="entity-description">{{ entity.description }}</span>
          </template>
          <template v-else-if="entity.type === 'place'">
            <i class="bi bi-box-seam-fill entity-icon"></i>
            <span class="entity-name">{{ entity.name }}</span>
            <span class="entity-description">{{ entity.description }}</span>
          </template>
          <template v-else-if="entity.type === 'item'">
            <i class="bi bi-bag-fill entity-icon"></i>
            <span class="entity-name">{{ entity.name }}</span>
            <span class="entity-description">{{ entity.description }}</span>
          </template>
        </template>
      </EntityTree>
    </ul>
    <div v-else-if="isLoading">{{ trans(loadingLabel) }}</div>
    <div v-else>{{ trans(emptyLabel) }}</div>
  </div>
</template>

<script>
import EntityTree from '@/components/EntityTree.vue';
import { trans } from '@/translations/translator.js';

export default {
  name: 'EntityList',
  components: { EntityTree },
  props: {
    fetchFunction: {
      type: Function,
      required: true,
    },
    loadingLabel: {
      type: String,
      required: true,
    },
    emptyLabel: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      rows: [],
      isLoading: true,
      error: null,
    };
  },
  mounted() {
    this.loadRows();
  },
  methods: {
    trans,
    buildTree(entities) {
      const map = new Map();
      entities.forEach((e) => map.set(e.id, { ...e, children: [] }));
      const roots = [];
      entities.forEach((e) => {
        const node = map.get(e.id);
        const parentId = e.parentId;
        if (parentId == null || parentId === 0) {
          roots.push(node);
        } else {
          const parent = map.get(parentId);
          if (parent) parent.children.push(node);
          else roots.push(node);
        }
      });
      return roots;
    },
    async loadRows() {
      try {
        this.isLoading = true;
        this.error = null;
        const flat = await this.fetchFunction();
        this.rows = this.buildTree(flat);
      } catch (error) {
        console.error('Error fetching entities:', error);
        this.error = error;
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
