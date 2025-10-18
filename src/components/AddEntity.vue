<template>
  <div>
    <form @submit.prevent="addEntity">
      <label for="type">{{ $t('addEntity.type') }}:</label>
      <select name="type" id="type" required v-model="newEntity.type">
        <option :value="null">{{ $t('addEntity.typeDefault') }}</option>
        <option value="item">{{ $t('addEntity.item') }}</option>
        <option value="category">{{ $t('addEntity.category') }}</option>
        <option value="place">{{ $t('addEntity.place') }}</option>
      </select>

      <label for="parent">{{ $t('addEntity.parentEntity') }}:</label>
      <select name="parent" id="parent" v-model="newEntity.parentId">
        <option :value="null">{{ $t('addEntity.null') }}</option>
        <option v-for="entity in allEntities" :key="entity.id" :value="entity.id">
          {{ entity.name }} ({{ entity.type }})
        </option>
      </select>

      <label for="name">{{ $t('addEntity.name') }}:</label>
      <input
        id="name"
        type="text"
        :placeholder="$t('addEntity.namePlaceholder')"
        required
        v-model="newEntity.name"
      />
      <label for="description">{{ $t('addEntity.description') }}:</label>
      <input
        id="description"
        type="text"
        :placeholder="$t('addEntity.descriptionPlaceholder')"
        v-model="newEntity.description"
      />

      <button type="submit">{{ $t('addEntity.add') }}</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { createEntity, getEntities } from '@/services/entityService.js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineOptions({
  name: 'AddEntity',
})

const allEntities = ref([])
const newEntity = ref({
  type: null,
  name: '',
  description: '',
  parentId: null,
})

onMounted(async () => {
  try {
    allEntities.value = await getEntities()
  } catch (error) {
    console.error('Error fetching entities:', error)
  }
})

async function addEntity() {
  try {
    const newId = await createEntity(newEntity.value)
    console.log('Entity added with id:', newId)
    // Reset form
    newEntity.value = {
      type: null,
      name: '',
      description: '',
      parentId: null,
    }
  } catch (error) {
    console.error('Error adding entity:', error)
  }
}
</script>

<style scoped></style>
