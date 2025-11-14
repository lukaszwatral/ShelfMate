<template>
  <AddEntity :initialType="initialType" />
</template>

<script>
import AddEntity from '@/components/AddEntity.vue'

export default {
  components: { AddEntity },
  props: {
    initialType: {
      type: String,
      default: null,
    },
  },
}
</script>

<style scoped></style>
