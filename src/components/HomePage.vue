<template>
  <div class="app-container">
    <AppHeader />
    <div class="homepage">
      <div class="logo">
        <img src="@/assets/images/logo.png" alt="logo" />
        <div class="title">
          <span class="title">ShelfMate</span>
        </div>
        <span class="subtitle">Składuj gdzie chcesz, jak chcesz.</span>
      </div>
      <div class="content">
        <div class="dashboard">
          <span>Panel</span>
          <div class="dashboard-content">
            <div class="tile-container">
              <div class="tile">0</div>
              <span class="tile-name">Przedmioty</span>
            </div>
            <div class="tile-container">
              <div class="tile">0</div>
              <span class="tile-name">Kategorie</span>
            </div>
            <div class="tile-container">
              <div class="tile">0</div>
              <span class="tile-name">Miejsca</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from '@/components/Header.vue'
import AppFooter from '@/components/Footer.vue'
</script>

<style scoped></style>
