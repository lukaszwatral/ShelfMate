<template>
  <div class="header shadow-sm">
    <div class="search-container shadow-sm">
      <input
        type="text"
        :placeholder="trans('header.searchPlaceholder')"
        v-model="inputValue"
        @input="handleInput"
      />

      <i v-if="inputValue" class="bi bi-x-lg icon-small" @click="clearSearch"></i>
      <i v-else class="bi bi-search icon-small"></i>
    </div>

    <i class="bi bi-upc-scan" @click="scanBarcode"></i>

    <router-link :to="{ name: 'addEntity' }">
      <i class="bi bi-plus icon-large" :class="{ active: route.name === 'addEntity' }"></i>
    </router-link>
  </div>
</template>

<script>
import { trans } from '@/translations/translator.js';
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerTypeHint,
} from '@capacitor/barcode-scanner';

export default {
  name: 'Header',
  emits: ['search', 'scan'],
  data() {
    return {
      inputValue: '',
      debounceTimer: null,
    };
  },
  computed: {
    route() {
      return this.$route;
    },
  },
  methods: {
    trans,

    handleInput() {
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.$emit('search', this.inputValue);
      }, 300);
    },

    clearSearch() {
      this.inputValue = '';
      this.$emit('search', '');
    },

    async scanBarcode() {
      try {
        const result = await CapacitorBarcodeScanner.scanBarcode({
          hint: CapacitorBarcodeScannerTypeHint.ALL,
        });

        if (result.ScanResult) {
          this.$emit('scan', result.ScanResult);

          this.inputValue = '';
          this.$emit('search', '');
        }
      } catch (e) {
        console.error('Błąd skanera:', e);
      }
    },
  },
};
</script>
