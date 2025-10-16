import { findAllByType } from '@/services/entityRepository.js'

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

export { getCategories, getPlaces, getItems }
