<template>
  <div class="header shadow-sm">
    <div class="search-container shadow-sm">
      <input type="text" :placeholder="$t('header.searchPlaceholder')" />
      <i class="bi bi-search icon-small"></i>
    </div>
    <i class="bi bi-upc-scan" @click="scanBarcode"></i>
    <router-link :to="{ name: 'addEntity' }">
      <i class="bi bi-plus icon-large"></i>
    </router-link>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerTypeHint,
} from '@capacitor/barcode-scanner'
import { ref } from 'vue'
const { t } = useI18n()
defineOptions({
  name: 'AppHeader',
})
const barcode = ref(null)
const scanBarcode = async () => {
  const result = await CapacitorBarcodeScanner.scanBarcode({
    hint: CapacitorBarcodeScannerTypeHint.ALL,
  })
  barcode.value = result.ScanResult

  console.log('Scanned barcode:', barcode.value)
}
</script>

<style scoped></style>
