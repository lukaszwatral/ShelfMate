<template>
  <div class="content-container entity-container">
    <EntityToggle />
    <router-link :to="{ name: 'addEntity', query: { initialType: 'item' } }">
      <div class="add-container shadow-sm">
        <span class="add-label">
          {{ trans('item.addItem') }}
        </span>

        <button class="add-circle-btn">
          <i class="bi bi-plus icon-large"></i>
        </button>
      </div>
    </router-link>
    <EntityList
      :fetch-function="getItems"
      :empty-label="'item.noItems'"
      :loading-label="'item.loading'"
    />
  </div>
</template>

<script>
import EntityList from '@/components/EntityList.vue';
import EntityToggle from '@/components/EntityToggle.vue';
import { trans } from '@/translations/translator.js';
import { entityRepository } from '@/db/index.js';

export default {
  name: 'Items',
  components: { EntityToggle, EntityList },
  methods: {
    trans,
    getItems() {
      return entityRepository.findBy({ type: 'item' });
    },
  },
};
</script>

<style scoped></style>
