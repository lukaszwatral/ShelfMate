<template>
  <div class="app-container">
    <AppHeader />
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
        <div class="dashboard shadow-sm">
          <span>{{ $t('home.dashboardTitle') }}</span>
          <div class="dashboard-content">
            <div class="tile-container">
              <div class="tile">
                <span>0</span>
              </div>
              <span class="tile-name">{{ $t('home.items') }}</span>
            </div>
            <div class="tile-container">
              <div class="tile">
                <span>0</span>
              </div>
              <span class="tile-name">{{ $t('home.categories') }}</span>
            </div>
            <div class="tile-container">
              <div class="tile">
                <span>0 </span>
              </div>
              <span class="tile-name">{{ $t('home.places') }}</span>
            </div>
          </div>
        </div>

        <button class="add-button shadow-sm">
          <i class="bi bi-plus icon-large"></i> {{ $t('home.addItem') }}
        </button>

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
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/Header.vue'
import AppFooter from '@/components/Footer.vue'
import { dbService } from '@/services/database.js'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const books = ref([])
const newBookTitle = ref('')
const isDbReady = ref(false)

onMounted(async () => {
  try {
    await dbService.initialize()
    isDbReady.value = true
  } catch (err) {
    console.error('Failed to initialize database on mount:', err)
  }
})
</script>

<style scoped></style>
