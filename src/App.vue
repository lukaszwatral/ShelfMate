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
import { Toast } from '@capacitor/toast';
import { CapacitorBarcodeScannerTypeHint } from '@capacitor/barcode-scanner';
import AppHeader from '@/components/Header.vue';
import AppFooter from '@/components/Footer.vue';
import SearchResults from '@/components/SearchResults.vue';
import { entityRepository } from '@/db/repositories/EntityRepository';
import { codeRepository } from '@/db/index.js';
import { trans } from '@/translations/translator.js';

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
    /**
     * Handles barcode scan results.
     */
    async handleScannedCode(scanResult) {
      const scannedValue = scanResult.ScanResult;
      const scannedType = scanResult.format
        ? CapacitorBarcodeScannerTypeHint[scanResult.format]
        : 'manual';

      await this.processCodeSearch(scannedType, scannedValue);
    },

    /**
     * Handles NFC tag detection.
     * Skips processing if currently on add/edit screens to prevent data loss or conflict.
     */
    async handleNfcTag(tag) {
      if (['addEntity', 'editEntity'].includes(this.$route.name)) {
        return;
      }

      if (!tag.id) return;
      const scannedValue = this.convertBytesToHex(tag.id);

      await this.processCodeSearch('nfc', scannedValue);
    },

    /**
     * Core logic to search for an entity by code (barcode or NFC).
     * Navigates to the entity view if found, otherwise shows a toast.
     */
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

    /**
     * Converts raw NFC byte array to a colon-separated hex string.
     */
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

    /**
     * Wrapper to handle NFC restart with a slight delay.
     * Needed for correct event listener removal.
     */
    handleNfcRestart() {
      setTimeout(() => {
        this.initGlobalNfc();
      }, 100);
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

    window.addEventListener('restart-global-nfc', this.handleNfcRestart);

    App.addListener('backButton', () => {
      if (this.isSearchActive) {
        this.isSearchActive = false;
        this.searchResults = [];
        return;
      }

      const openOffcanvas = document.querySelector('.offcanvas.show');
      if (openOffcanvas) {
        const bsOffcanvas = window.bootstrap?.Offcanvas.getInstance(openOffcanvas);
        if (bsOffcanvas) {
          bsOffcanvas.hide();
        } else {
          const closeBtn = openOffcanvas.querySelector('[data-bs-dismiss="offcanvas"]');
          if (closeBtn) closeBtn.click();
          else openOffcanvas.classList.remove('show');
        }
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
    window.removeEventListener('restart-global-nfc', this.handleNfcRestart);
    if (this.nfcListener) await this.nfcListener.remove();
    try {
      await CapacitorNfc.stopScanning();
    } catch (e) {}
    await App.removeAllListeners();
  },
};
</script>
