<template>
  <AddEntity :initialType="initialType" :mode="mode" :entityId="entityId" />

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
    mode: {
      type: String,
      default: 'add',
    },
    entityId: {
      type: [Number, String],
      default: null,
    },
  },
}
</script>

<style scoped></style>
