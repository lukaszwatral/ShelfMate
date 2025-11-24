import { db } from '../database.js';
import { Entity } from '../models/Entity.js';

export class EntityRepository {
  /**
   * Znajduje wszystkie encje danego typu
   * @param {'item'|'category'|'place'|null} type
   * @returns {Promise<Entity[]>}
   */
  async findAll(type = null) {
    let query = db.selectFrom('Entity').selectAll();

    if (type) {
      query = query.where('type', '=', type);
    }

    const results = await query.where('is_archived', '=', 0).orderBy('sort_order', 'asc').execute();

    return results.map((row) => new Entity(row));
  }

  /**
   * Znajduje encję po ID
   * @param {number} id
   * @returns {Promise<Entity|null>}
   */
  async find(id) {
    const result = await db
      .selectFrom('Entity')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();

    return result ? new Entity(result) : null;
  }

  /**
   * Znajduje jedną encję po kryteriach
   * @param {Object} criteria
   * @returns {Promise<Entity|null>}
   */
  async findOneBy(criteria) {
    let query = db.selectFrom('Entity');

    Object.entries(criteria).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      query = query.where(snakeKey, '=', value);
    });

    const result = await query.selectAll().executeTakeFirst();
    return result ? new Entity(result) : null;
  }

  /**
   * Znajduje wiele encji po kryteriach
   * @param {Object} criteria
   * @returns {Promise<Entity[]>}
   */
  async findBy(criteria) {
    let query = db.selectFrom('Entity');

    Object.entries(criteria).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      query = query.where(snakeKey, '=', value);
    });

    const results = await query.selectAll().execute();
    return results.map((row) => new Entity(row));
  }

  /**
   * Zapisuje encję (insert lub update)
   * @param {Entity} entity
   * @returns {Promise<Entity>}
   */
  async save(entity) {
    const data = entity.toDatabase();

    if (entity.getId()) {
      // Update
      const result = await db
        .updateTable('Entity')
        .set(data)
        .where('id', '=', entity.getId())
        .returningAll()
        .executeTakeFirst();

      return new Entity(result);
    } else {
      // Insert
      const result = await db.insertInto('Entity').values(data).returningAll().executeTakeFirst();

      return new Entity(result);
    }
  }

  /**
   * Usuwa encję
   * @param {Entity} entity
   */
  async remove(entity) {
    const id = typeof entity.getId === 'function' ? entity.getId() : entity.id;
    await db.deleteFrom('Entity').where('id', '=', id).execute();
  }

  /**
   * Znajduje dzieci danej encji
   * @param {number} parentId
   * @param {'item'|'category'|'place'|null} type
   * @returns {Promise<Entity[]>}
   */
  async findChildren(parentId, type = null) {
    let query = db
      .selectFrom('Entity')
      .where('parent_id', '=', parentId)
      .where('is_archived', '=', 0);

    if (type) {
      query = query.where('type', '=', type);
    }

    const results = await query.selectAll().execute();
    return results.map((row) => new Entity(row));
  }

  /**
   * Wyszukuje encje
   * @param {string} searchTerm
   * @param {'item'|'category'|'place'|null} type
   * @returns {Promise<Entity[]>}
   */
  async search(searchTerm, type = null) {
    let query = db
      .selectFrom('Entity')
      .where('is_archived', '=', 0)
      .where((eb) =>
        eb.or([
          eb('name', 'like', `%${searchTerm}%`),
          eb('description', 'like', `%${searchTerm}%`),
        ]),
      );

    if (type) {
      query = query.where('type', '=', type);
    }

    const results = await query.selectAll().execute();
    return results.map((row) => new Entity(row));
  }

  /**
   * Zlicza encje
   * @param {Object} criteria
   * @returns {Promise<number>}
   */
  async count(criteria = {}) {
    let query = db.selectFrom('Entity');

    Object.entries(criteria).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      query = query.where(snakeKey, '=', value);
    });

    const result = await query.select((eb) => eb.fn.count('id').as('count')).executeTakeFirst();

    return Number(result.count);
  }
}

// Singleton instance
export const entityRepository = new EntityRepository();
