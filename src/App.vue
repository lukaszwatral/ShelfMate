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

<script>
// Importy
import { CapacitorNfc } from '@capgo/capacitor-nfc';
import AppHeader from '@/components/Header.vue';
import AppFooter from '@/components/Footer.vue';

export default {
  name: 'App',
  // W Options API musimy ręcznie zarejestrować komponenty
  components: {
    AppHeader,
    AppFooter,
  },
  data() {
    return {
      nfcListener: null, // Miejsce na uchwyt do listenera
    };
  },
  methods: {
    // Funkcja pomocnicza: Hex Converter
    convertBytesToHex(byteArray) {
      if (!byteArray) return '';
      return byteArray
        .map((byte) => ('0' + (byte & 0xff).toString(16)).slice(-2))
        .join(':')
        .toUpperCase();
    },

    // Główna funkcja inicjalizująca NFC
    async initGlobalNfc() {
      try {
        // 1. Czyścimy stare listenery
        await CapacitorNfc.removeAllListeners();

        // 2. Ustawiamy listenera
        // Zapisujemy go do 'this.nfcListener', żeby móc go potem usunąć
        this.nfcListener = await CapacitorNfc.addListener('nfcEvent', (event) => {
          console.log('Global NFC Event:', event);

          if (event.tag && event.tag.id) {
            const scannedId = this.convertBytesToHex(event.tag.id);
            console.log('Złapano tag:', scannedId);

            // 3. Przekierowanie
            // W Options API używamy 'this.$router'
            this.$router.push({
              name: 'NfcScanner',
              params: { tagId: scannedId },
            });
          }
        });

        // 4. Startujemy skanowanie
        await CapacitorNfc.startScanning({
          invalidateAfterFirstRead: false,
          alertMessage: 'Przyłóż tag do skanowania',
        });
      } catch (err) {
        console.warn('Błąd inicjalizacji NFC:', err);
      }
    },
  },
  // Cykl życia: Start aplikacji
  mounted() {
    this.initGlobalNfc();
  },
  // Cykl życia: Zamknięcie aplikacji (sprzątanie)
  async beforeUnmount() {
    if (this.nfcListener) {
      await this.nfcListener.remove();
    }
    try {
      await CapacitorNfc.stopScanning();
      await CapacitorNfc.removeAllListeners();
    } catch (e) {
      // Ignorujemy błędy przy zamykaniu
    }
  },
};
</script>

<style>
/* Twoje style globalne */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
