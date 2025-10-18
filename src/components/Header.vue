<template>
  <div class="header shadow-sm">
    <div class="search-container shadow-sm">
      <input type="text" placeholder="Wyszukaj przedmiot..." />
      <i class="bi bi-search icon-small"></i>
    </div>
    <i class="bi bi-upc-scan"></i>
    <router-link :to="{ name: 'addEntity' }">
      <i class="bi bi-plus icon-large"></i>
    </router-link>
  </div>
</template>

<script setup>
defineOptions({
  name: 'AppHeader',
})
</script>

<style scoped></style>
