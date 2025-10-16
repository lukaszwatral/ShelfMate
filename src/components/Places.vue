<template>
  <div class="content-container entity-container">
    <EntityToggle />
    <button class="add-button shadow-sm">
      <i class="bi bi-plus icon-large"></i> {{ $t('place.addPlace') }}
    </button>
    <div class="entity-list">
      <ul v-for="place in places" v-bind:key="place.id">
        <li class="shadow-sm">{{ place.name }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getPlaces } from '@/services/entityService.js'
import EntityToggle from '@/components/EntityToggle.vue'

defineOptions({
  name: 'PlacesList',
})

const places = ref([])
const isLoading = ref(true)
const error = ref(null)

const loadPlaces = async () => {
  try {
    isLoading.value = true
    error.value = null
    places.value = await getPlaces()
  } catch (err) {
    console.error('Błąd:, err')
    error.value = err
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadPlaces()
})
</script>

<style scoped></style>
