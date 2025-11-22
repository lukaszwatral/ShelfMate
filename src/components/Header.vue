<template>
  <div class="header shadow-sm">
    <div class="search-container shadow-sm">
      <input type="text" :placeholder="trans('header.searchPlaceholder')" />
      <i class="bi bi-search icon-small"></i>
    </div>
    <i class="bi bi-upc-scan" @click="scanBarcode"></i>
    <router-link :to="{ name: 'addEntity' }">
      <i class="bi bi-plus icon-large" :class="{ active: route.name === 'addEntity' }"></i>
    </router-link>
  </div>
</template>

<script>
import { trans } from '@/translations/translator.js'
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerTypeHint,
} from '@capacitor/barcode-scanner'

export default {
  name: 'Header',
  data() {
    return {
      barcode: null,
    }
  },
  methods: {
    trans,
    async scanBarcode() {
      const result = await CapacitorBarcodeScanner.scanBarcode({
        hint: CapacitorBarcodeScannerTypeHint.ALL,
      })
      this.barcode = result.ScanResult
    },
  },
  computed: {
    route() {
      return this.$route
    },
  },
}
</script>

<style scoped></style>
