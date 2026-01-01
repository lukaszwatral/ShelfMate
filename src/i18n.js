import { createI18n } from 'vue-i18n';
const messages = {};
const modules = import.meta.glob('./translations/messages.*.js', { eager: true });
Object.entries(modules).forEach(([path, mod]) => {
  const locale = path.match(/messages\.(\w+)\.js$/)[1];
  messages[locale] = mod.default;
});

export function createAppI18n(locale) {
  return createI18n({
    legacy: false,
    locale,
    fallbackLocale: 'en',
    messages,
  });
}
