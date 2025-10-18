<template>
  <div class="entity-toggle">
    <div class="entity-toggle-option" :class="{ active: route.name === 'item' }">
      <router-link :to="{ name: 'item' }"
        ><span>{{ $t('item.title') }}</span></router-link
      >
    </div>
    <div class="entity-toggle-option" :class="{ active: route.name === 'category' }">
      <router-link :to="{ name: 'category' }"
        ><span>{{ $t('category.title') }}</span></router-link
      >
    </div>
    <div class="entity-toggle-option" :class="{ active: route.name === 'place' }">
      <router-link :to="{ name: 'place' }"
        ><span>{{ $t('place.title') }}</span></router-link
      >
    </div>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
defineOptions({
  name: 'EntityToggle',
})

const route = useRoute()
</script>

<style scoped></style>
