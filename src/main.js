import './assets/styles/main.scss'
import i18n from './i18n'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import 'bootstrap'

import App from './App.vue'
import router from './router'
import { initializeDatabase } from '@/services/database.js'

const startApp = async () => {
  try {
    // Wait for the database to be initialized
    await initializeDatabase()
    console.log('Database initialized, starting Vue app.')

    const app = createApp(App)

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
