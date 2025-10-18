<template>
  <div class="app-container">
    <AppHeader />
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <AppFooter />
  </div>
</template>
<script setup>
import { onMounted, onUnmounted } from 'vue'
import { initializeDatabase, getDb, closeDbConnection } from './services/database.js'
import AppHeader from '@/components/Header.vue'
import AppFooter from '@/components/Footer.vue'

async function startApp() {
  try {
    await initializeDatabase()
    console.log('Inicjalizacja bazy danych zakończona.')
  } catch (error) {
    console.error('Nie udało się zainicjować bazy danych.', error)
  }
}

onMounted(() => {
  startApp()
})
</script>
<style></style>
