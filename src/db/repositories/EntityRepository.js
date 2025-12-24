import { db } from '../database.js';
import { sql } from 'kysely';
import { Entity } from '../models/Entity.js';

/**
 * Helper: Prepares a safe query for FTS5 (sanitizes and adds wildcards).
 */
function prepareSearchQuery(query) {
  if (!query) return '';
  // Remove special characters, keep letters/numbers/spaces (supports Unicode \p{L})
  const sanitized = query.replace(/[^a-zA-Z0-9\s\p{L}]/gu, '').trim();

  if (!sanitized) return '';

  // Split into terms and add wildcard * to each
  return sanitized
    .split(/\s+/)
    .map((term) => `"${term}"*`)
    .join(' ');
}

export class EntityRepository {
  /**
   * Finds all active (non-deleted) entities of a given type.
   * @param {'item'|'category'|'place'|null} type
   * @returns {Promise<Entity[]>}
   */
  async findAll(type = null) {
    let query = db.selectFrom('Entity').selectAll();

    if (type) {
      query = query.where('type', '=', type);
    }

    const results = await query
      .where('deleted_at', 'is', null)
      .where('is_archived', '=', 0)
      .orderBy('sort_order', 'asc')
      .execute();

    return results.map((row) => new Entity(row));
  }

  /**
   * Finds an entity by ID.
   * @param {number} id
   * @returns {Promise<Entity|null>}
   */
  async find(id) {
    const result = await db
      .selectFrom('Entity')
      .where('id', '=', id)
      .where('deleted_at', 'is', null)
      .selectAll()
      .executeTakeFirst();

    return result ? new Entity(result) : null;
  }

  /**
   * Finds a single entity by specific criteria.
   */
  async findOneBy(criteria) {
    let query = db.selectFrom('Entity').where('deleted_at', 'is', null);

    Object.entries(criteria).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      query = query.where(snakeKey, '=', value);
    });

    const result = await query.selectAll().executeTakeFirst();
    return result ? new Entity(result) : null;
  }

  /**
   * Finds multiple entities by specific criteria.
   */
  async findBy(criteria) {
    let query = db.selectFrom('Entity').where('deleted_at', 'is', null);

    Object.entries(criteria).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      query = query.where(snakeKey, '=', value);
    });

    const results = await query.selectAll().execute();
    return results.map((row) => new Entity(row));
  }

  /**
   * Saves an entity (Insert or Update).
   */
  async save(entity) {
    const data = entity.toDatabase();

    if (entity.getId()) {
      // Update: Exclude created_at to preserve original creation date
      const { created_at, ...updateData } = data;

      await db
        .updateTable('Entity')
        .set(updateData)
        .where('id', '=', entity.getId())
        .executeTakeFirst();

      return entity.getId();
    } else {
      // Insert
      const result = await db.insertInto('Entity').values(data).executeTakeFirst();
      return result.insertId;
    }
  }

  /**
   * Removes an entity using Soft Delete strategy.
   */
  async remove(entity) {
    const id = typeof entity.getId === 'function' ? entity.getId() : entity.id;

    // 1. Mark as deleted in the main table
    await db
      .updateTable('Entity')
      .set({ deleted_at: sql`CURRENT_TIMESTAMP` })
      .where('id', '=', id)
      .execute();

    // 2. Physically remove from FTS index so it doesn't appear in search results
    await sql`DELETE FROM EntitySearch WHERE entity_id = ${id}`.execute(db);
  }

  /**
   * Finds children of a given entity (for hierarchy).
   */
  async findChildren(parentId, type = null) {
    let query = db
      .selectFrom('Entity')
      .where('parent_id', '=', parentId)
      .where('deleted_at', 'is', null)
      .where('is_archived', '=', 0);

    if (type) {
      query = query.where('type', '=', type);
    }

    const results = await query.selectAll().execute();
    return results.map((row) => new Entity(row));
  }

  /**
   * Performs full-text search using FTS5.
   * @param {string} searchTerm
   * @param {'item'|'category'|'place'|null} type
   * @returns {Promise<Entity[]>}
   */
  async search(searchTerm, type = null) {
    const ftsQuery = prepareSearchQuery(searchTerm);

    if (!ftsQuery) return [];

    let query = db
      .selectFrom('Entity as e')
      // Join with virtual FTS table
      .innerJoin('EntitySearch as es', 'es.entity_id', 'e.id')
      .selectAll('e')
      // Use MATCH operator
      .where(sql`EntitySearch`, 'match', ftsQuery)
      .where('e.deleted_at', 'is', null);

    if (type) {
      query = query.where('e.type', '=', type);
    }

    // Sort by rank (relevance)
    const results = await query.orderBy(sql`rank`).execute();

    return results.map((row) => new Entity(row));
  }

  /**
   * Counts active entities based on criteria.
   */
  async count(criteria = {}) {
    let query = db.selectFrom('Entity').where('deleted_at', 'is', null);

    Object.entries(criteria).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      query = query.where(snakeKey, '=', value);
    });

    const result = await query.select((eb) => eb.fn.count('id').as('count')).executeTakeFirst();

    return Number(result.count);
  }

  /**
   * Szuka encji po dokładnym kodzie (kreskowym, QR, NFC).
   * Zwraca encję lub null.
   */
  async findByCode(codeValue) {
    const result = await db
      .selectFrom('Code')
      .innerJoin('Entity', 'Entity.id', 'Code.entity_id')
      .where('Code.code_value', '=', codeValue)
      .where('Entity.deleted_at', 'is', null) // Tylko aktywne
      .selectAll('Entity')
      .executeTakeFirst();

    return result ? new Entity(result) : null;
  }
}

export const entityRepository = new EntityRepository();
