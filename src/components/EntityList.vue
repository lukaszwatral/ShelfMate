<template>
  <div class="entity-list mt-3">
    <ul v-if="rows.length" class="list-unstyled">
      <EntityTree v-for="row in rows" :key="row.id" :entity="row">
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
    <div v-else-if="isLoading">{{ $t(loadingLabel) }}</div>
    <div v-else>{{ $t(emptyLabel) }}</div>
  </div>
</template>

<script setup>
import EntityTree from '@/components/EntityTree.vue'
import EntityToggle from '@/components/EntityToggle.vue'
import { onMounted, ref } from 'vue'

const props = defineProps({
  fetchFunction: {
    type: Function,
    required: true,
  },
  loadingLabel: {
    type: String,
    required: true,
  },
  emptyLabel: {
    type: String,
    required: true,
  },
})

const rows = ref([])
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

const loadRows = async () => {
  try {
    isLoading.value = true
    error.value = null
    const flat = await props.fetchFunction()
    rows.value = buildTree(flat)
  } catch (err) {
    console.error('Błąd:', err)
    error.value = err
  } finally {
    isLoading.value = false
  }
}

onMounted(loadRows)
</script>
