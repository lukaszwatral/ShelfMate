<template>
  <div class="content-container entity-container">
    <EntityToggle />
    <router-link :to="{ name: 'addEntity', query: { initialType: 'place' } }">
      <button class="add-button shadow-sm">
        <i class="bi bi-plus icon-large"></i> {{ $t('place.addPlace') }}
      </button>
    </router-link>

    <EntityList
      :fetch-function="getPlaces"
      :empty-label="'place.noPlaces'"
      :loading-label="'place.loading'"
    />
  </div>
</template>

<script setup>
import { getPlaces } from '@/services/entityService.js'
import EntityList from '@/components/EntityList.vue'
import EntityToggle from '@/components/EntityToggle.vue'

defineOptions({ name: 'PlacesList' })
</script>

<style scoped></style>
