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
import AppHeader from '@/components/Header.vue';
import AppFooter from '@/components/Footer.vue';
</script>

<style></style>
