<template>
  <div class="app-container">
    <AppHeader />
    <main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <AppFooter />
  </div>
</template>
<script setup>
import { onMounted } from 'vue'
import { initializeDatabase, getDb } from './services/database.js'
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
