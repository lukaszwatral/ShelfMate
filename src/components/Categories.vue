<template>
  <div class="content-container entity-container">
    <EntityToggle />
    <router-link :to="{ name: 'addEntity' }">
      <button class="add-button shadow-sm">
        <i class="bi bi-plus icon-large"></i> {{ $t('category.addCategory') }}
      </button>
    </router-link>

    <EntityList
      :fetch-function="getCategories"
      :add-label="'category.addCategory'"
      :empty-label="'category.noCategories'"
      :loading-label="'category.loading'"
    />
  </div>
</template>

<script setup>
import { getCategories } from '@/services/entityService.js'
import EntityList from '@/components/EntityList.vue'
import EntityToggle from '@/components/EntityToggle.vue'

defineOptions({ name: 'PlacesList' })
</script>

<style scoped></style>
