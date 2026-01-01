const FlagMapEnum = {
  pl: new URL('@/assets/flags/pl.svg', import.meta.url).href,
  en: new URL('@/assets/flags/en.svg', import.meta.url).href,
  de: new URL('@/assets/flags/de.svg', import.meta.url).href,
  fr: new URL('@/assets/flags/fr.svg', import.meta.url).href,
  es: new URL('@/assets/flags/es.svg', import.meta.url).href,
};

export function flagSrc(code) {
  return FlagMapEnum[code] || '';
}

export default FlagMapEnum;
