import { db } from '../database.js';
import { Tag } from '../models/Tag.js';

export class TagRepository {
  /**
   * Retrieves all tags ordered by name.
   * @returns {Promise<Tag[]>}
   */
  async findAll() {
    const results = await db.selectFrom('Tag').selectAll().orderBy('name', 'asc').execute();
    return results.map((row) => new Tag(row));
  }

  /**
   * Finds a tag by its ID.
   * @param {number} id
   * @returns {Promise<Tag|null>}
   */
  async find(id) {
    const result = await db.selectFrom('Tag').where('id', '=', id).selectAll().executeTakeFirst();
    return result ? new Tag(result) : null;
  }

  /**
   * Finds a single tag matching the criteria.
   * @param {Object} criteria
   * @returns {Promise<Tag|null>}
   */
  async findOneBy(criteria) {
    let query = db.selectFrom('Tag');
    query = this._applyCriteria(query, criteria);

    const result = await query.selectAll().executeTakeFirst();
    return result ? new Tag(result) : null;
  }

  /**
   * Finds all tags matching the criteria.
   * @param {Object} criteria
   * @returns {Promise<Tag[]>}
   */
  async findBy(criteria) {
    let query = db.selectFrom('Tag');
    query = this._applyCriteria(query, criteria);

    const results = await query.selectAll().execute();
    return results.map((row) => new Tag(row));
  }

  /**
   * Saves or updates a tag.
   * @param {Tag} tag
   * @returns {Promise<number>} ID of the saved tag.
   */
  async save(tag) {
    const data = tag.toDatabase();

    if (tag.getId()) {
      await db.updateTable('Tag').set(data).where('id', '=', tag.getId()).executeTakeFirst();

      return tag.getId();
    } else {
      const result = await db.insertInto('Tag').values(data).executeTakeFirst();
      return Number(result.insertId);
    }
  }

  /**
   * Removes a tag.
   * @param {Tag} tag
   */
  async remove(tag) {
    await db.deleteFrom('Tag').where('id', '=', tag.getId()).execute();
  }

  // ==========================================
  // Entity Relations (Many-to-Many via EntityTag)
  // ==========================================

  /**
   * Retrieves all tags associated with a specific entity.
   * @param {number} entityId
   * @returns {Promise<Tag[]>}
   */
  async findEntityTags(entityId) {
    const results = await db
      .selectFrom('EntityTag')
      .innerJoin('Tag', 'Tag.id', 'EntityTag.tag_id')
      .where('EntityTag.entity_id', '=', entityId)
      .select(['Tag.id', 'Tag.name', 'Tag.color', 'Tag.icon', 'Tag.created_at'])
      .execute();

    return results.map((row) => new Tag(row));
  }

  /**
   * Links a tag to an entity.
   * @param {Tag} tag
   * @param {number} entityId
   */
  async addToEntity(tag, entityId) {
    await db.insertInto('EntityTag').values({ entity_id: entityId, tag_id: tag.getId() }).execute();
  }

  /**
   * Unlinks a tag from an entity.
   * @param {Tag} tag
   * @param {number} entityId
   */
  async removeFromEntity(tag, entityId) {
    await db
      .deleteFrom('EntityTag')
      .where('entity_id', '=', entityId)
      .where('tag_id', '=', tag.getId())
      .execute();
  }

  /**
   * Helper to apply WHERE clauses from a criteria object.
   * Converts camelCase keys (JS) to snake_case columns (DB).
   * @param {Object} query - Kysely query builder.
   * @param {Object} criteria - Filter object.
   * @returns {Object} Modified query builder.
   * @private
   */
  _applyCriteria(query, criteria) {
    Object.entries(criteria).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      query = query.where(snakeKey, '=', value);
    });
    return query;
  }
}

export const tagRepository = new TagRepository();
