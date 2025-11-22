<template>
  <div class="content-container entity-container">
    <EntityToggle />
    <router-link :to="{ name: 'addEntity', query: { initialType: 'place' } }">
      <div class="add-container shadow-sm">
        <span class="add-label">
          {{ trans('place.addPlace') }}
        </span>

        <button class="add-circle-btn">
          <i class="bi bi-plus icon-large"></i>
        </button>
      </div>
    </router-link>

    <EntityList
      :fetch-function="getPlaces"
      :empty-label="'place.noPlaces'"
      :loading-label="'place.loading'"
    />
  </div>
</template>

<script>
import { getPlaces } from '@/services/entityService.js'
import EntityList from '@/components/EntityList.vue'
import EntityToggle from '@/components/EntityToggle.vue'
import { trans } from '@/translations/translator.js'

export default {
  name: 'Places',
  components: { EntityToggle, EntityList },
  methods: {
    trans,
    getPlaces,
  },
}
</script>

<style scoped></style>
