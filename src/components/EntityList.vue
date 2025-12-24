<template>
  <div
    class="mt-3"
    :class="{
      'entity-list': this.viewMode === 'list',
      'entity-list-folder': this.viewMode === 'folder',
    }"
  >
    <div class="buttons-container">
      <button class="action-button">
        <i class="bi bi-funnel"></i>
      </button>
      <span></span>
      <button
        class="action-button"
        @click="setViewMode('folder')"
        :class="{ active: viewMode === 'folder' }"
      >
        <i class="bi bi-list"></i>
      </button>
      <button
        class="action-button"
        @click="setViewMode('list')"
        :class="{ active: viewMode === 'list' }"
      >
        <i class="bi bi-grid"></i>
      </button>
    </div>
    <div v-if="viewMode === 'list'">
      <ul v-if="rows.length" class="list-unstyled">
        <EntityTree
          v-for="row in rows"
          :key="row.id"
          :entity="row"
          :view="viewMode"
          @removeEntity="loadRows"
        >
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
    <div v-else>
      <button class="btn btn-primary" v-if="currentPath.length" @click="goUp">
        <i class="bi bi-chevron-left"></i>
      </button>
      <ul v-if="currentEntities.length" class="list-unstyled">
        <EntityTree
          v-for="entity in currentEntities"
          :key="entity.id"
          :entity="entity"
          :view="viewMode"
          @removeEntity="loadRows"
          @enter="enter"
        >
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
      viewMode: 'list',
      currentPath: [],
    };
  },
  computed: {
    currentEntities() {
      let entities = this.rows;
      for (const id of this.currentPath) {
        const found = entities.find((e) => e.id === id);
        if (found && found.children) entities = found.children;
        else break;
      }
      return entities;
    },
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
    setViewMode(mode) {
      this.viewMode = mode;
      this.currentPath = [];
    },
    enter(entity) {
      if (entity.children && entity.children.length) {
        this.currentPath.push(entity.id);
      }
    },
    goUp() {
      this.currentPath.pop();
    },
  },
};
</script>
