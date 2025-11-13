<template>
  <div class="content-container entity-container">
    <EntityToggle />
    <div class="buttons-container">
      <button class="action-button">
        <i class="bi bi-funnel"></i>
      </button>

      <span></span>
      <button class="action-button">
        <i class="bi bi-list"></i>
      </button>

      <button class="action-button">
        <i class="bi bi-grid"></i>
      </button>
    </div>
    <router-link :to="{ name: 'addEntity', query: { initialType: 'item' } }">
      <button class="add-button shadow-sm">
        <i class="bi bi-plus icon-large"></i> {{ $t('item.addItem') }}
      </button>
    </router-link>
    <EntityList
      :fetch-function="getItems"
      :empty-label="'item.noItems'"
      :loading-label="'item.loading'"
    />
  </div>
</template>

<script setup>
import { getItems } from '@/services/entityService.js'
import EntityToggle from '@/components/EntityToggle.vue'
import EntityList from '@/components/EntityList.vue'

defineOptions({
  name: 'Items',
})
</script>

<style scoped></style>
