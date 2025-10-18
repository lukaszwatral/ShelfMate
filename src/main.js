import './assets/styles/main.scss'
import { createAppI18n } from './i18n'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import 'bootstrap'

import App from './App.vue'
import router from './router'
import { closeDbConnection, initializeDatabase } from '@/services/database.js'
import { getLocale, getLocaleCode } from '@/services/settings.js'

const startApp = async () => {
  try {
    // Zamknij istniejące połączenie z bazą przed inicjalizacją
    await closeDbConnection()
    // Wait for the database to be initialized
    await initializeDatabase()
    console.log('Database initialized, starting Vue app.')

    // Poprawka: pobierz locale z bazy
    const locale = await getLocaleCode()

    const app = createApp(App)
    const i18n = createAppI18n(locale)

    app.use(createPinia())
    app.use(router)
    app.use(i18n)

    app.mount('#app')
  } catch (error) {
    console.error('Failed to initialize database or start the app:', error)
    // Optionally, show an error message to the user
    document.getElementById('app').innerHTML =
      '<h1>Error</h1><p>Could not initialize the application. Please try again later.</p>'
  }
}

startApp()
