import { createI18n } from 'vue-i18n'
import pl from './translations/messages.pl.js'
import en from './translations/messages.en.js'

const messages = { pl, en }

export default createI18n({
  legacy: false,
  locale: 'pl',
  fallbackLocale: 'en',
  messages,
})
