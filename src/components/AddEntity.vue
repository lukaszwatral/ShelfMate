<template>
  <div class="add-entity-container">
    <form @submit.prevent="addEntity">
      <div class="form-floating">
        <select name="type" class="form-select" id="type" required v-model="newEntity.type">
          <option :value="null">{{ $t('addEntity.typeDefault') }}</option>
          <option value="item">{{ $t('addEntity.item') }}</option>
          <option value="category">{{ $t('addEntity.category') }}</option>
          <option value="place">{{ $t('addEntity.place') }}</option>
        </select>
        <label for="type">{{ $t('addEntity.type') }}</label>
      </div>

      <div class="form-floating">
        <select name="parent" id="parent" class="form-select" v-model="newEntity.parentId">
          <option :value="null">{{ $t('addEntity.null') }}</option>
          <option v-for="entity in allEntities" :key="entity.id" :value="entity.id">
            {{ entity.name }} ({{ entity.type }})
          </option>
        </select>
        <label for="parent">{{ $t('addEntity.parentEntity') }}</label>
      </div>
      <div class="form-floating">
        <input
          id="name"
          type="text"
          class="form-control"
          :placeholder="$t('addEntity.namePlaceholder')"
          required
          v-model="newEntity.name"
        />
        <label for="name" class="form-label">{{ $t('addEntity.name') }}</label>
      </div>
      <div class="form-floating">
        <textarea
          id="description"
          type="text"
          :placeholder="$t('addEntity.descriptionPlaceholder')"
          v-model="newEntity.description"
          class="form-control"
        />
        <label for="description">{{ $t('addEntity.description') }}</label>
      </div>

      <button class="btn btn-primary" type="submit">{{ $t('addEntity.add') }}</button>
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

async function fetchEntities() {
  try {
    allEntities.value = await getEntities()
  } catch (error) {
    console.error('Error fetching entities:', error)
  }
}
onMounted(async () => {
  await fetchEntities()
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

    await fetchEntities()
  } catch (error) {
    console.error('Error adding entity:', error)
  }
}
</script>

<style scoped></style>
