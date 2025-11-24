import './assets/styles/main.scss';
import { createAppI18n } from './i18n';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import 'bootstrap';

import App from './App.vue';
import router from './router';
import { initializeDatabase, settingRepository } from '@/db';

const startApp = async () => {
  try {
    // Inicjalizacja bazy danych z Kysely
    await initializeDatabase();
    console.log('Database initialized, starting Vue app.');

    // Pobierz locale z bazy używając repository
    const dbLocale = await settingRepository.getValue('locale');
    const locale = dbLocale || 'en';

    const app = createApp(App);
    const i18n = createAppI18n(locale);

    app.use(createPinia());
    app.use(router);
    app.use(i18n);
    app.provide('i18n', i18n); // Dodano provide instancji i18n

    app.mount('#app');
  } catch (error) {
    console.error('Failed to initialize database or start the app:', error);
    // Pokaż błąd użytkownikowi
    document.getElementById('app').innerHTML =
      '<h1>Error</h1><p>Could not initialize the application. Please try again later.</p>';
  }
};

startApp();
