import './assets/styles/main.scss';
import { createAppI18n } from './i18n';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import 'bootstrap';

import App from './App.vue';
import router from './router';
import { initializeDatabase, settingRepository } from '@/db';

/**
 * Asynchronous application entry point.
 * Initializes the database and retrieves user settings before mounting the Vue app.
 */
const startApp = async () => {
  try {
    await initializeDatabase();

    const dbLocale = await settingRepository.getValue('locale');
    const locale = dbLocale || 'en';

    const app = createApp(App);
    const i18n = createAppI18n(locale);

    app.use(createPinia());
    app.use(router);
    app.use(i18n);

    // Provide the i18n instance globally
    app.provide('i18n', i18n);

    app.mount('#app');
  } catch (error) {
    console.error('Critical initialization error:', error);

    // Fallback UI for the user in case of critical failure
    const appElement = document.getElementById('app');
    if (appElement) {
      appElement.innerHTML = `
        <div class="container mt-5 text-center text-danger">
          <h1>System Error</h1>
          <p>Could not initialize the application. Please reload or contact support.</p>
        </div>
      `;
    }
  }
};

startApp();
