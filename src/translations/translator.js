import { inject } from 'vue';

export function trans(key, values, i18nInstance) {
  const i18n = i18nInstance || inject('i18n');
  if (!i18n) {
    console.warn('Brak instancji i18n w kontekście aplikacji');
    return key;
  }
  return i18n.global.t(key, values);
}
