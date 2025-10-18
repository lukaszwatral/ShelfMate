<template>
  <div class="homepage">
    <div class="logo-container">
      <div class="logo">
        <img src="@/assets/images/logo.png" alt="logo" />
        <div class="title">
          <span class="title">ShelfMate</span>
        </div>
      </div>
      <span class="subtitle">{{ $t('home.subtitle') }}</span>
    </div>
    <div class="content">
      <div class="dashboard shadow-sm" v-if="dashboardData">
        <span>{{ $t('home.dashboardTitle') }}</span>
        <div class="dashboard-content">
          <router-link :to="{ name: 'item' }">
            <div class="tile-container">
              <div class="tile">
                <span>{{ itemsCount }}</span>
              </div>

              <span class="tile-name">{{ $t('home.items') }}</span>
            </div>
          </router-link>
          <router-link :to="{ name: 'category' }">
            <div class="tile-container">
              <div class="tile">
                <span>{{ categoriesCount }}</span>
              </div>
              <span class="tile-name">{{ $t('home.categories') }}</span>
            </div>
          </router-link>
          <router-link :to="{ name: 'place' }">
            <div class="tile-container">
              <div class="tile">
                <span>{{ placesCount }}</span>
              </div>
              <span class="tile-name">{{ $t('home.places') }}</span>
            </div>
          </router-link>
        </div>
      </div>

      <router-link :to="{ name: 'addEntity' }">
        <button class="add-button shadow-sm">
          <i class="bi bi-plus icon-large"></i> {{ $t('home.addItem') }}
        </button>
      </router-link>

      <div class="collection-slider-container">
        <span>{{ $t('home.largestCollections') }}</span>
        <div class="collection-slider">
          <img class="img-thumbnail" src="@/assets/images/logo.png" alt="logo" />
          <span>{{ $t('home.collection') }}</span>
          <div class="count-container">
            <span>0</span>
            <span>{{ $t('home.items') }}</span>
          </div>
        </div>
      </div>
      <div class="collection-slider-container">
        <span>{{ $t('home.recentCollections') }}</span>
        <div class="collection-slider">
          <img class="img-thumbnail" src="@/assets/images/logo.png" alt="logo" />
          <span>{{ $t('home.collection') }}</span>
          <div class="count-container">
            <span>0</span>
            <span>{{ $t('home.items') }}</span>
          </div>
        </div>
      </div>

      <div class="expiry-date-items shadow-sm">
        <i class="bi bi-exclamation"></i>
        <span>2</span>
        <span>{{ $t('home.expiryWarning') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { getDashboardData } from '@/services/entityService.js'

const localecode = ref('')
const dashboardData = ref({ items: [], categories: [], places: [] })

const itemsCount = computed(() => dashboardData.value?.items?.length ?? 0)
const categoriesCount = computed(() => dashboardData.value?.categories?.length ?? 0)
const placesCount = computed(() => dashboardData.value?.places?.length ?? 0)

onMounted(async () => {
  try {
    const data = await getDashboardData()
    dashboardData.value = data ?? { items: [], categories: [], places: [] }
  } catch (e) {
    dashboardData.value = { items: [], categories: [], places: [] }
  }
})
</script>

<style scoped></style>
