<template>
  <div class="app-container">
    <AppHeader @search="performSearch" @scan="handleScannedCode" />

    <SearchResults
      :results="searchResults"
      :is-visible="isSearchActive"
      @select="handleSelection"
    />

    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <AppFooter />
  </div>
</template>

<script>
import { CapacitorNfc } from '@capgo/capacitor-nfc';
import { App } from '@capacitor/app';
import AppHeader from '@/components/Header.vue';
import AppFooter from '@/components/Footer.vue';
import SearchResults from '@/components/SearchResults.vue';
import { entityRepository } from '@/db/repositories/EntityRepository';
import { Toast } from '@capacitor/toast';
import { trans } from '@/translations/translator.js';
import { codeRepository } from '@/db/index.js';
import { CapacitorBarcodeScannerTypeHint } from '@capacitor/barcode-scanner';

export default {
  name: 'App',
  components: { AppHeader, AppFooter, SearchResults },
  data() {
    return {
      nfcListener: null,
      searchResults: [],
      isSearchActive: false,
    };
  },
  watch: {
    $route() {
      this.isSearchActive = false;
      this.searchResults = [];
      if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
      }
    },
  },
  methods: {
    async handleScannedCode(scanResult) {
      const scannedValue = scanResult.ScanResult;
      const scannedType = scanResult.format
        ? CapacitorBarcodeScannerTypeHint[scanResult.format]
        : 'manual';

      await this.processCodeSearch(scannedType, scannedValue);
    },

    async handleNfcTag(tag) {
      if (['addEntity', 'editEntity'].includes(this.$route.name)) {
        return;
      }

      if (!tag.id) return;
      const scannedValue = this.convertBytesToHex(tag.id);

      await this.processCodeSearch('nfc', scannedValue);
    },

    async processCodeSearch(type, value) {
      let entity = await codeRepository.findEntityByCode(type, value);

      if (!entity) {
        entity = await codeRepository.findEntityByValueOnly(value);
      }

      if (entity) {
        this.$router.push({ name: 'viewEntity', params: { id: entity.id } });
      } else {
        await Toast.show({
          text: trans('header.scannedNotFound', {}, this.$.appContext.provides.i18n),
          duration: 'short',
        });
      }
      this.isSearchActive = false;
    },

    convertBytesToHex(byteArray) {
      if (!byteArray) return '';
      return byteArray
        .map((byte) => ('0' + (byte & 0xff).toString(16)).slice(-2))
        .join(':')
        .toUpperCase();
    },

    async initGlobalNfc() {
      try {
        await CapacitorNfc.removeAllListeners();
        try {
          await CapacitorNfc.stopScanning();
        } catch (e) {}

        this.nfcListener = await CapacitorNfc.addListener('nfcEvent', (event) => {
          const tag = event.tag || event;
          this.handleNfcTag(tag);
        });

        await CapacitorNfc.startScanning({ invalidateAfterFirstRead: false });
      } catch (err) {
        console.warn('NFC Init Warning:', err);
      }
    },

    async performSearch(query) {
      if (!query || query.length < 2) {
        this.searchResults = [];
        this.isSearchActive = false;
        return;
      }
      this.isSearchActive = true;
      this.searchResults = await entityRepository.search(query);
    },

    handleSelection(entity) {
      if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
      }
      this.isSearchActive = false;
      this.searchResults = [];
      this.$router.push({ name: 'viewEntity', params: { id: entity.id } });
    },
  },
  async mounted() {
    await this.initGlobalNfc();

    window.addEventListener('restart-global-nfc', () => {
      setTimeout(() => {
        this.initGlobalNfc();
      }, 100);
    });

    App.addListener('backButton', () => {
      if (this.isSearchActive) {
        this.isSearchActive = false;
        this.searchResults = [];
        return;
      }

      const openModal = document.querySelector('.modal.show');
      if (openModal) {
        const closeBtn = openModal.querySelector('[data-bs-dismiss="modal"]');
        if (closeBtn) closeBtn.click();
        else openModal.classList.remove('show');
        return;
      }

      if (this.$route.path !== '/' && this.$route.name !== 'home') {
        this.$router.back();
      } else {
        App.exitApp();
      }
    });
  },
  async beforeUnmount() {
    window.removeEventListener('restart-global-nfc', this.initGlobalNfc);
    if (this.nfcListener) await this.nfcListener.remove();
    try {
      await CapacitorNfc.stopScanning();
    } catch (e) {}
    await App.removeAllListeners();
  },
};
</script>
