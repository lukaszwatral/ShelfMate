<template>
  <HomePage />

  <!--  <RouterView />-->
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
