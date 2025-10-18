import { getDb } from '@/services/database.js'

const findAll = async () => {
  const db = getDb()
  const result = await db.query(`SELECT id, name, type FROM Entity ORDER BY name;`)
  return result.values || []
}

const findAllByType = async (entityType) => {
  const db = getDb()
  const result = await db.query(`SELECT * FROM Entity WHERE type = ?;`, [entityType])
  return result.values || []
}

const addEntity = async (entity) => {
  const db = getDb()
  const result = await db.query(
    `INSERT INTO Entity (type, name, description, parent_id) VALUES (?, ?, ?, ?);`,
    [entity.type, entity.name, entity.description, entity.parentId || null],
  )
  return result.insertId || null
}

export { findAll, findAllByType, addEntity }
