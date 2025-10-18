<template>
  <div>
    <form @submit.prevent="addEntity">
      <label for="type">Typ:</label>
      <select name="type" id="type" required v-model="newEntity.type">
        <option disabled selected>Wybierz typ</option>
        <option value="item">Przedmiot</option>
        <option value="category">Kategoria</option>
        <option value="place">Miejsce</option>
      </select>

      <label for="parent">Encja nadrzędna:</label>
      <select name="parent" id="parent" v-model="newEntity.parentId">
        <option :value="null">Brak</option>
        <option v-for="entity in allEntities" :key="entity.id" :value="entity.id">
          {{ entity.name }} ({{ entity.type }})
        </option>
      </select>

      <label for="name">Nazwa:</label>
      <input id="name" type="text" placeholder="np. zestaw LEGO" required v-model="newEntity.name" />
      <label for="description">Opis:</label>
      <input
        id="description"
        type="text"
        placeholder="np. LEGO 75192 Star Wars Sokół Millennium"
        v-model="newEntity.description"
      />

      <button type="submit">Dodaj</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { createEntity, getEntities } from '@/services/entityService.js'

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
