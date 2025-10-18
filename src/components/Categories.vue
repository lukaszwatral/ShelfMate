<template>
  <div class="content-container entity-container">
    <EntityToggle />
    <router-link :to="{ name: 'addEntity' }">
      <button class="add-button shadow-sm">
        <i class="bi bi-plus icon-large"></i> {{ $t('category.addCategory') }}
      </button>
    </router-link>
    <div class="entity-list mt-3">
      <ul v-if="categories.length" class="list-unstyled">
        <EntityTree v-for="category in categories" :key="category.id" :entity="category">
          <template #entity="{ entity }">
            <template v-if="entity.type === 'category'">
              <i class="bi bi-tag-fill entity-icon"></i>
              <span class="entity-name">{{ entity.name }}</span>
              <span class="entity-description">{{ entity.description }}</span>
            </template>
            <template v-else-if="entity.type === 'place'">
              <i class="bi bi-box-seam-fill entity-icon"></i>
              <span class="entity-name">{{ entity.name }}</span>
              <span class="entity-description">{{ entity.description }}</span>
            </template>
            <template v-else-if="entity.type === 'item'">
              <i class="bi bi-bag-fill entity-icon"></i>
              <span class="entity-name">{{ entity.name }}</span>
              <span class="entity-description">{{ entity.description }}</span>
            </template>
          </template>
        </EntityTree>
      </ul>

      <div v-else-if="isLoading">Ładowanie...</div>
      <div v-else-if="error">Błąd: {{ error.message || error }}</div>
      <div v-else>Brak miejsc</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getCategories } from '@/services/entityService.js'
import EntityToggle from '@/components/EntityToggle.vue'
import EntityTree from '@/components/EntityTree.vue'
const { t } = useI18n()

defineOptions({
  name: 'Categories',
})

const categories = ref([])
const isLoading = ref(true)
const error = ref(null)

const buildTree = (entities) => {
  const map = new Map()
  entities.forEach((e) => map.set(e.id, { ...e, children: [] }))
  const roots = []
  entities.forEach((e) => {
    const node = map.get(e.id)
    const parentId = e.parent_id
    if (parentId == null || parentId === 0) roots.push(node)
    else {
      const parent = map.get(parentId)
      if (parent) parent.children.push(node)
      else roots.push(node)
    }
  })
  return roots
}
const loadCategories = async () => {
  try {
    isLoading.value = true
    error.value = null
    const flat = await getCategories()
    categories.value = buildTree(flat)
  } catch (err) {
    console.error('Błąd kategorii:', err)
    error.value = err
  } finally {
    isLoading.value = false
  }
}

onMounted(loadCategories)
</script>

<style scoped></style>
