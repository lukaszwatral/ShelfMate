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
        <div class="dashboard shadow-sm">
          <span>Panel</span>
          <div class="dashboard-content">
            <div class="tile-container">
              <div class="tile">
                <span>0</span>
              </div>
              <span class="tile-name">Przedmioty</span>
            </div>
            <div class="tile-container">
              <div class="tile">
                <span>0</span>
              </div>
              <span class="tile-name">Kategorie</span>
            </div>
            <div class="tile-container">
              <div class="tile">
                <span>0 </span>
              </div>
              <span class="tile-name">Miejsca</span>
            </div>
          </div>
        </div>

        <button class="add-button shadow-sm">
          <i class="bi bi-plus icon-large"></i> Dodaj przedmiot
        </button>

        <div class="collection-slider-container">
          <span>Największe kolekcje: </span>
          <div class="collection-slider">
            <img class="img-thumbnail" src="@/assets/images/logo.png" alt="logo" />
            <span>Kolekcja</span>
            <div class="count-container">
              <span>0</span>
              <span>Przedmioty</span>
            </div>
          </div>
        </div>
        <div class="collection-slider-container">
          <span>Ostatnie kolekcje: </span>
          <div class="collection-slider">
            <img class="img-thumbnail" src="@/assets/images/logo.png" alt="logo" />
            <span>Kolekcja</span>
            <div class="count-container">
              <span>0</span>
              <span>Przedmioty</span>
            </div>
          </div>
        </div>

        <div class="expiry-date-items shadow-sm">
          <i class="bi bi-exclamation"></i>
          <span>2</span>
          <span>przedmiotom kończy się termin przydatności</span>
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
