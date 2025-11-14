<template>
  <div class="content-container entity-container">
    <EntityToggle />
    <router-link :to="{ name: 'addEntity', query: { initialType: 'category' } }">
      <button class="add-button shadow-sm">
        <i class="bi bi-plus icon-large"></i> {{ trans('category.addCategory') }}
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

<script>
import { getCategories } from '@/services/entityService.js'
import EntityList from '@/components/EntityList.vue'
import EntityToggle from '@/components/EntityToggle.vue'
import { trans } from '@/translations/translator.js'

export default {
  name: 'Categories',
  components: { EntityToggle, EntityList },
  methods: {
    trans,
    getCategories,
  },
}
</script>

<style scoped></style>
