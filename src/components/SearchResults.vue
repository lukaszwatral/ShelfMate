<template>
  <div v-if="isVisible" class="search-overlay">
    <div v-if="results.length > 0" class="results-container">
      <EntityListItem
        v-for="item in results"
        :key="item.id"
        :entity="item"
        @click="$emit('select', item)"
      />
      <div style="height: 80px"></div>
    </div>

    <div v-else class="no-results">
      <i class="bi bi-search display-1 opacity-25"></i>
      <p class="mt-3 text-muted">{{ trans('header.searchNotFound') }}</p>
    </div>
  </div>
</template>

<script>
import EntityListItem from '@/components/EntityListItem.vue';
import { trans } from '@/translations/translator.js';

export default {
  name: 'SearchResults',
  components: { EntityListItem },
  props: {
    results: {
      type: Array,
      default: () => [],
    },
    isVisible: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['select'],
  methods: { trans },
};
</script>

<style scoped></style>
