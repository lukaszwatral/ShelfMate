import { db } from '../database.js';
import { CustomField } from '../models/CustomField.js';

export class CustomFieldRepository {
  async findAll() {
    const results = await db.selectFrom('CustomField').selectAll().execute();

    return results.map((row) => new CustomField(row));
  }

  async find(id) {
    const result = await db
      .selectFrom('CustomField')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();

    return result ? new CustomField(result) : null;
  }

  async findOneBy(criteria) {
    let query = db.selectFrom('CustomField');

    Object.entries(criteria).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      query = query.where(snakeKey, '=', value);
    });

    const result = await query.selectAll().executeTakeFirst();
    return result ? new CustomField(result) : null;
  }

  async findBy(criteria) {
    let query = db.selectFrom('CustomField');

    Object.entries(criteria).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      query = query.where(snakeKey, '=', value);
    });

    const results = await query.selectAll().execute();
    return results.map((row) => new CustomField(row));
  }

  async save(customField) {
    const data = customField.toDatabase();

    if (customField.getId()) {
      const result = await db
        .updateTable('CustomField')
        .set(data)
        .where('id', '=', customField.getId())
        .executeTakeFirst();

      return customField.getId();
    } else {
      const result = await db.insertInto('CustomField').values(data).executeTakeFirst();

      return result.insertId;
    }
  }

  async remove(customField) {
    await db.deleteFrom('CustomField').where('id', '=', customField.getId()).execute();
  }

  /**
   * Znajduje pola niestandardowe dla kategorii (szablon)
   * @param {number} categoryId
   * @returns {Promise<CustomField[]>}
   */
  async findByCategoryTemplate(categoryId) {
    const results = await db
      .selectFrom('CustomField')
      .where('category_template_id', '=', categoryId)
      .where('is_archived', '=', 0)
      .selectAll()
      .orderBy('sort_order', 'asc')
      .execute();

    return results.map((row) => new CustomField(row));
  }

  /**
   * Znajduje pola niestandardowe przypisane bezpośrednio do encji
   * @param {number} entityId
   * @returns {Promise<CustomField[]>}
   */
  async findByEntity(entityId) {
    const results = await db
      .selectFrom('CustomField')
      .where('entity_id', '=', entityId)
      .where('is_archived', '=', 0)
      .selectAll()
      .orderBy('sort_order', 'asc')
      .execute();

    return results.map((row) => new CustomField(row));
  }

  /**
   * Archiwizuje pole (soft delete)
   * @param {CustomField} customField
   */
  async archive(customField) {
    customField.setIsArchived(true);
    return await this.save(customField);
  }

  async count(criteria = {}) {
    let query = db.selectFrom('CustomField');

    Object.entries(criteria).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      query = query.where(snakeKey, '=', value);
    });

    const result = await query.select((eb) => eb.fn.count('id').as('count')).executeTakeFirst();

    return Number(result.count);
  }
}

export const customFieldRepository = new CustomFieldRepository();
