import { getDb } from '@/services/database.js'

async function getLocale() {
  const db = getDb()
  const result = await db.query(
    `SELECT name, code FROM Locale where code=(SELECT value FROM Setting WHERE key = 'locale');`,
  )
  return result.values[0] || []
}

async function getLocaleCode() {
  const db = getDb()
  const result = await db.query(`SELECT value FROM Setting WHERE key = 'locale';`)
  return result.values[0]?.value || []
}

async function getAvailableLocales() {
  const db = getDb()
  const result = await db.query(`SELECT name, code FROM Locale;`)

  return result.values || []
}

async function setLocale(locale) {
  const db = getDb()
  await db.query(`UPDATE Setting SET value = ? WHERE key = 'locale';`, [locale])

  return
}
export { getLocale, getAvailableLocales, setLocale, getLocaleCode }
