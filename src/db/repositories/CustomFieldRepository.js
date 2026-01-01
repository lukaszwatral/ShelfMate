import { db } from '../database.js';
import { CustomField } from '../models/CustomField.js';

export class CustomFieldRepository {
  /**
   * Retrieves all custom fields.
   * @returns {Promise<CustomField[]>}
   */
  async findAll() {
    const results = await db.selectFrom('CustomField').selectAll().execute();
    return results.map((row) => new CustomField(row));
  }

  /**
   * Finds a custom field by its ID.
   * @param {number} id
   * @returns {Promise<CustomField|null>}
   */
  async find(id) {
    const result = await db
      .selectFrom('CustomField')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();
    return result ? new CustomField(result) : null;
  }

  /**
   * Finds a single custom field matching the criteria.
   * @param {Object} criteria - Key-value pairs for filtering.
   * @returns {Promise<CustomField|null>}
   */
  async findOneBy(criteria) {
    let query = db.selectFrom('CustomField');
    query = this._applyCriteria(query, criteria);

    const result = await query.selectAll().executeTakeFirst();
    return result ? new CustomField(result) : null;
  }

  /**
   * Finds all custom fields matching the criteria.
   * @param {Object} criteria - Key-value pairs for filtering.
   * @returns {Promise<CustomField[]>}
   */
  async findBy(criteria) {
    let query = db.selectFrom('CustomField');
    query = this._applyCriteria(query, criteria);

    const results = await query.selectAll().execute();
    return results.map((row) => new CustomField(row));
  }

  /**
   * Saves or updates a custom field.
   * @param {CustomField} customField
   * @returns {Promise<number>} The ID of the saved field.
   */
  async save(customField) {
    const data = customField.toDatabase();

    if (customField.getId()) {
      await db
        .updateTable('CustomField')
        .set(data)
        .where('id', '=', customField.getId())
        .executeTakeFirst();
      return customField.getId();
    } else {
      const result = await db.insertInto('CustomField').values(data).executeTakeFirst();
      return Number(result.insertId);
    }
  }

  /**
   * Deletes a custom field.
   * @param {CustomField|number} customField - The model instance or ID.
   */
  async remove(customField) {
    const id =
      typeof customField.getId === 'function' ? customField.getId() : customField.id || customField;
    await db.deleteFrom('CustomField').where('id', '=', id).execute();
  }

  /**
   * Finds custom fields defined in a category template (sorted by order).
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
   * Finds ad-hoc custom fields attached directly to a specific entity.
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
   * Soft deletes a custom field (sets is_archived = 1).
   * @param {CustomField} customField
   */
  async archive(customField) {
    customField.setIsArchived(true);
    return await this.save(customField);
  }

  /**
   * Counts records matching the criteria.
   * @param {Object} criteria
   * @returns {Promise<number>}
   */
  async count(criteria = {}) {
    let query = db.selectFrom('CustomField');
    query = this._applyCriteria(query, criteria);

    const result = await query.select((eb) => eb.fn.count('id').as('count')).executeTakeFirst();
    return Number(result.count);
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

export const customFieldRepository = new CustomFieldRepository();
