import { getDb } from '@/services/database.js'

const findAllByType = async (entityType) => {
  const db = getDb()
  const result = await db.query(`SELECT * FROM Entity WHERE type = ?;`, [entityType])
  return result.values || []
}

export { findAllByType }
