<script setup>
import AddEntity from '@/components/AddEntity.vue'

const props = defineProps({
  initialType: {
    type: String,
    default: null,
  },
})
</script>

<template>
  <AddEntity :initialType="props.initialType" />
</template>

<style scoped></style>
