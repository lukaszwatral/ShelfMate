<template>
  <div class="content-container entity-container">
    <EntityToggle />
    <button class="add-button shadow-sm">
      <i class="bi bi-plus icon-large"></i> {{ $t('category.addCategory') }}
    </button>
    <div class="entity-list">
      <ul v-for="category in categories" v-bind:key="category.id">
        <li class="shadow-sm">{{ category.name }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getCategories } from '@/services/entityService.js'
import EntityToggle from '@/components/EntityToggle.vue'
const { t } = useI18n()

defineOptions({
  name: 'Categories',
})

const categories = ref([])
const isLoading = ref(true)
const error = ref(null)
const loadCategories = async () => {
  try {
    isLoading.value = true
    error.value = null
    categories.value = await getCategories()
  } catch (err) {
    console.error('Błąd kategorii:', err)
    error.value = err
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped></style>
