import { createI18n } from 'vue-i18n';
import pl from './translations/messages.pl.js';
import en from './translations/messages.en.js';

const messages = { pl, en };

export function createAppI18n(locale) {
  return createI18n({
    legacy: false,
    locale,
    fallbackLocale: 'en',
    messages,
  });
}
