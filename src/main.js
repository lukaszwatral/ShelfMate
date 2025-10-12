import './assets/styles/main.scss'
import i18n from './i18n'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import 'bootstrap'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
