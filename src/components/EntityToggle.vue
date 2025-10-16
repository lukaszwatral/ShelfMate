<template>
  <div class="entity-toggle">
    <div class="entity-toggle-option" :class="{ active: route.name === 'item' }">
      <router-link :to="{ name: 'item' }"><span>Przedmioty</span></router-link>
    </div>
    <div class="entity-toggle-option" :class="{ active: route.name === 'category' }">
      <router-link :to="{ name: 'category' }"><span>Kategorie</span></router-link>
    </div>
    <div class="entity-toggle-option" :class="{ active: route.name === 'place' }">
      <router-link :to="{ name: 'place' }"><span>Miejsca</span></router-link>
    </div>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'

defineOptions({
  name: 'EntityToggle',
})

const route = useRoute()
</script>

<style scoped></style>
