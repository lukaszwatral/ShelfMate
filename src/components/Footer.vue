<template>
  <div class="footer shadow-sm">
    <nav>
      <ul>
        <li>
          <router-link :to="{ name: 'home' }">
            <i class="bi bi-house-fill" :class="{ active: route.name === 'home' }"></i>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'item' }">
            <i class="bi bi-bag-fill" :class="{ active: route.name === 'item' }"></i>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'category' }">
            <i class="bi bi-tag-fill" :class="{ active: route.name === 'category' }"></i>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'place' }">
            <i class="bi bi-box-seam-fill" :class="{ active: route.name === 'place' }"></i>
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'settings' }">
            <i class="bi bi-gear-fill" :class="{ active: route.name === 'settings' }"></i>
          </router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'Footer',
  computed: {
    route() {
      return this.$route
    },
  },
}
</script>

<style scoped></style>
