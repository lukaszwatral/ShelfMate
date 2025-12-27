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
import AppHeader from '@/components/Header.vue';
import AppFooter from '@/components/Footer.vue';
import SearchResults from '@/components/SearchResults.vue';
import { entityRepository } from '@/db/repositories/EntityRepository';
import { Toast } from '@capacitor/toast';
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
    async handleScannedCode(codeValue) {
      const entity = await entityRepository.findByCode(codeValue);

      if (entity) {
        this.$router.push({ name: 'viewEntity', params: { id: entity.id } });
      } else {
        setTimeout(async () => {
          await Toast.show({
            text: trans('header.scannedNotFound', {}, this.$.appContext.provides.i18n),
            duration: 'short',
          });
        }, 500);
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
        this.nfcListener = await CapacitorNfc.addListener('nfcEvent', (event) => {
          if (event.tag && event.tag.id) {
            const scannedId = this.convertBytesToHex(event.tag.id);
            this.handleScannedCode(scannedId);
          }
        });
        await CapacitorNfc.startScanning({ invalidateAfterFirstRead: false });
      } catch (err) {
        console.warn('NFC Error:', err);
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

      if (entity.type === 'item') {
        this.$router.push({ name: 'itemDetails', params: { id: entity.id } });
      } else {
        this.$router.push({ name: 'folderView', params: { parentId: entity.id } });
      }
    },
  },
  mounted() {
    this.initGlobalNfc();
  },
  async beforeUnmount() {
    if (this.nfcListener) await this.nfcListener.remove();
    try {
      await CapacitorNfc.stopScanning();
    } catch (e) {}
  },
};
</script>
