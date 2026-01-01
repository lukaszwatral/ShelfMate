import { createI18n } from 'vue-i18n';

const messages = {};

// Dynamically import all translation files from the ./translations directory.
// This relies on Vite's import.meta.glob feature with eager loading.
const modules = import.meta.glob('./translations/messages.*.js', { eager: true });

Object.entries(modules).forEach(([path, mod]) => {
  // Extract the locale code from the filename (e.g., 'messages.en.js' -> 'en')
  const match = path.match(/messages\.(\w+)\.js$/);
  if (match) {
    const locale = match[1];
    messages[locale] = mod.default;
  }
});

/**
 * Creates and configures the Vue I18n instance.
 *
 * @param {string} locale - The initial locale code (e.g., 'en', 'pl').
 * @returns {import('vue-i18n').I18n} The configured i18n instance.
 */
export function createAppI18n(locale) {
  return createI18n({
    legacy: false, // Use Composition API mode
    locale,
    fallbackLocale: 'en',
    messages,
  });
}
