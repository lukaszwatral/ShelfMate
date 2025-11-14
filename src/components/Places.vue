<template>
  <div class="content-container entity-container">
    <EntityToggle />
    <router-link :to="{ name: 'addEntity', query: { initialType: 'place' } }">
      <button class="add-button shadow-sm">
        <i class="bi bi-plus icon-large"></i> {{ trans('place.addPlace') }}
      </button>
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
