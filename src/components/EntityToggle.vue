<template>
  <div class="entity-toggle">
    <div class="entity-toggle-option" :class="{ active: route.name === 'item' }">
      <router-link :to="{ name: 'item' }"
        ><span>{{ trans('item.title') }}</span></router-link
      >
    </div>
    <div class="entity-toggle-option" :class="{ active: route.name === 'category' }">
      <router-link :to="{ name: 'category' }"
        ><span>{{ trans('category.title') }}</span></router-link
      >
    </div>
    <div class="entity-toggle-option" :class="{ active: route.name === 'place' }">
      <router-link :to="{ name: 'place' }"
        ><span>{{ trans('place.title') }}</span></router-link
      >
    </div>
  </div>
</template>
<script>
import { trans } from '@/translations/translator.js'

export default {
  name: 'EntityToggle',
  methods: {
    trans,
  },
  computed: {
    route() {
      return this.$route
    },
  },
}
</script>

<style scoped></style>
