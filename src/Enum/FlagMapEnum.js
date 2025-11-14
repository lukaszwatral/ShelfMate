const FlagMapEnum = {
  pl: new URL('@/assets/flags/pl.svg', import.meta.url).href,
  en: new URL('@/assets/flags/en.svg', import.meta.url).href,
}

export function flagSrc(code) {
  return FlagMapEnum[code] || ''
}

export default FlagMapEnum
