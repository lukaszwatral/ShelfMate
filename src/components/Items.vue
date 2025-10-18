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
    <router-link :to="{ name: 'addEntity' }">
      <button class="add-button shadow-sm">
        <i class="bi bi-plus icon-large"></i> {{ $t('item.addItem') }}
      </button>
    </router-link>
    <div class="entity-list">
      <ul v-for="item in items" v-bind:key="item.id">
        <li class="shadow-sm">{{ item.name }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getItems } from '@/services/entityService.js'
import EntityToggle from '@/components/EntityToggle.vue'

defineOptions({
  name: 'Items',
})

const items = ref([])
const isLoading = ref(true)
const error = ref(null)

const loadItems = async () => {
  try {
    isLoading.value = true
    error.value = null
    items.value = await getItems()
  } catch (err) {
    console.error('Błąd:, err')
    error.value = err
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadItems()
})
</script>

<style scoped></style>
