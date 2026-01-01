/**
 * Mapping of locale codes to static flag asset URLs.
 * Uses Vite's URL handling for static assets.
 */
const FlagMapEnum = {
  pl: new URL('@/assets/flags/pl.svg', import.meta.url).href,
  en: new URL('@/assets/flags/en.svg', import.meta.url).href,
  de: new URL('@/assets/flags/de.svg', import.meta.url).href,
  fr: new URL('@/assets/flags/fr.svg', import.meta.url).href,
  es: new URL('@/assets/flags/es.svg', import.meta.url).href,
};

/**
 * Retrieves the flag image source URL for a given country code.
 * @param {string} code - Two-letter country/locale code (e.g., 'pl', 'en').
 * @returns {string} The URL string for the image or an empty string if not found.
 */
export function flagSrc(code) {
  return FlagMapEnum[code] || '';
}

export default FlagMapEnum;
