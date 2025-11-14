import { i18n } from '@/i18n.js'

export function trans(key, values) {
  return i18n.global.t(key, values)
}
