import { db } from '../database.js';
import { CustomFieldValue } from '../models/CustomFieldValue.js';

export class CustomFieldValueRepository {
  /**
   * Retrieves all custom field values.
   * @returns {Promise<CustomFieldValue[]>}
   */
  async findAll() {
    const results = await db.selectFrom('CustomFieldValue').selectAll().execute();
    return results.map((row) => new CustomFieldValue(row));
  }

  /**
   * Finds a value by its specific ID.
   * @param {number} id
   * @returns {Promise<CustomFieldValue|null>}
   */
  async find(id) {
    const result = await db
      .selectFrom('CustomFieldValue')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();
    return result ? new CustomFieldValue(result) : null;
  }

  /**
   * Finds a single value matching the criteria.
   * @param {Object} criteria
   * @returns {Promise<CustomFieldValue|null>}
   */
  async findOneBy(criteria) {
    let query = db.selectFrom('CustomFieldValue');
    query = this._applyCriteria(query, criteria);

    const result = await query.selectAll().executeTakeFirst();
    return result ? new CustomFieldValue(result) : null;
  }

  /**
   * Finds all values matching the criteria.
   * @param {Object} criteria
   * @returns {Promise<CustomFieldValue[]>}
   */
  async findBy(criteria) {
    let query = db.selectFrom('CustomFieldValue');
    query = this._applyCriteria(query, criteria);

    const results = await query.selectAll().execute();
    return results.map((row) => new CustomFieldValue(row));
  }

  /**
   * Saves a custom field value.
   * Uses "UPSERT" logic: inserts new record or updates existing one based on entity_id + custom_field_id unique constraint.
   * @param {CustomFieldValue} customFieldValue
   * @returns {Promise<number>} ID of the saved record.
   */
  async save(customFieldValue) {
    const data = customFieldValue.toDatabase();

    if (customFieldValue.getId()) {
      await db
        .updateTable('CustomFieldValue')
        .set(data)
        .where('id', '=', customFieldValue.getId())
        .executeTakeFirst();
      return customFieldValue.getId();
    } else {
      const result = await db
        .insertInto('CustomFieldValue')
        .values(data)
        .onConflict((oc) =>
          oc
            .columns(['entity_id', 'custom_field_id'])
            .doUpdateSet({ field_value: data.field_value }),
        )
        .executeTakeFirst();
      return Number(result.insertId);
    }
  }

  /**
   * Removes a specific value record.
   * @param {CustomFieldValue|number} customFieldValue
   */
  async remove(customFieldValue) {
    const id =
      typeof customFieldValue.getId === 'function'
        ? customFieldValue.getId()
        : customFieldValue.id || customFieldValue;
    await db.deleteFrom('CustomFieldValue').where('id', '=', id).execute();
  }

  /**
   * Finds all values associated with a specific entity.
   * @param {number} entityId
   * @returns {Promise<CustomFieldValue[]>}
   */
  async findByEntity(entityId) {
    const results = await db
      .selectFrom('CustomFieldValue')
      .where('entity_id', '=', entityId)
      .selectAll()
      .execute();
    return results.map((row) => new CustomFieldValue(row));
  }

  /**
   * Retrieves values joined with their parent CustomField definition.
   * Useful for UI rendering where both value and field metadata (name, type) are needed.
   * @param {number} entityId
   * @returns {Promise<Object[]>} Array of composite objects (not Model instances).
   */
  async findByEntityWithFields(entityId) {
    const results = await db
      .selectFrom('CustomFieldValue as cfv')
      .innerJoin('CustomField as cf', 'cf.id', 'cfv.custom_field_id')
      .where('cfv.entity_id', '=', entityId)
      .select([
        'cfv.id',
        'cfv.entity_id as entityId',
        'cfv.custom_field_id as customFieldId',
        'cfv.field_value as fieldValue',
        'cf.field_name as fieldName',
        'cf.field_type as fieldType',
        'cf.is_required as isRequired',
        'cf.options',
      ])
      .execute();
    return results;
  }

  /**
   * Quick helper to set a specific value for an entity's custom field.
   * Creates a new instance and triggers save (upsert).
   * @param {number} entityId
   * @param {number} customFieldId
   * @param {string} value
   * @returns {Promise<number>}
   */
  async setFieldValue(entityId, customFieldId, value) {
    const fieldValue = new CustomFieldValue({
      entity_id: entityId,
      custom_field_id: customFieldId,
      field_value: value,
    });
    return await this.save(fieldValue);
  }

  /**
   * Removes all custom field values for a given entity.
   * @param {number} entityId
   */
  async removeByEntity(entityId) {
    await db.deleteFrom('CustomFieldValue').where('entity_id', '=', entityId).execute();
  }

  /**
   * Counts records matching the criteria.
   * @param {Object} criteria
   * @returns {Promise<number>}
   */
  async count(criteria = {}) {
    let query = db.selectFrom('CustomFieldValue');
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

export const customFieldValueRepository = new CustomFieldValueRepository();
