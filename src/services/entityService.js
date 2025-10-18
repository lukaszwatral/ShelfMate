import { findAll, findAllByType, addEntity } from '@/services/entityRepository.js'

async function getEntities() {
  const entities = await findAll()
  return entities
}

async function getCategories() {
  const categories = await findAllByType('category')

  return categories
}

async function getPlaces() {
  const places = await findAllByType('place')

  return places
}

async function getItems() {
  const items = await findAllByType('item')

  return items
}

async function createEntity(entity) {
  const result = await addEntity(entity)

  return result
}

async function getDashboardData() {
  const categories = await getCategories()
  const places = await getPlaces()
  const items = await getItems()

  return {
    categories,
    places,
    items,
  }
}

export { getEntities, getCategories, getPlaces, getItems, createEntity, getDashboardData }
