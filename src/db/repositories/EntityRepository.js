import { db } from '../database.js';
import { sql } from 'kysely';
import { Entity } from '../models/Entity.js';

/**
 * Helper: Sanitizes and prepares a query string for SQLite FTS5.
 * Removes special characters and adds wildcards for prefix matching.
 * @param {string} query
 * @returns {string}
 */
function prepareSearchQuery(query) {
  if (!query) return '';
  // Allow letters, numbers, and spaces. Remove FTS syntax chars like OR, AND, etc.
  const sanitized = query.replace(/[^a-zA-Z0-9\s\p{L}]/gu, '').trim();
  if (!sanitized) return '';

  // Append * to each word for prefix search
  return sanitized
    .split(/\s+/)
    .map((term) => `"${term}"*`)
    .join(' ');
}

export class EntityRepository {
  /**
   * Complex transaction to create an Entity along with its Codes, Template Fields,
   * and Ad-Hoc Attributes (CustomFields created on the fly).
   * * @param {Entity} entityData - The main entity model.
   * @param {Object} codeData - { type: string, value: string }
   * @param {Object} templateFieldsData - Key-value pairs of { fieldId: value }
   * @param {Array} adHocAttributes - Array of objects defining new fields and values.
   * @returns {Promise<number>} The ID of the newly created Entity.
   */
  async createWithRelatedData(entityData, codeData, templateFieldsData, adHocAttributes) {
    return await db.transaction().execute(async (trx) => {
      // 1. Save Entity
      const dbData = entityData.toDatabase();

      // Clean up fields handled by DB defaults
      delete dbData.id;
      delete dbData.created_at;
      delete dbData.updated_at;
      delete dbData.deleted_at;

      const entityResult = await trx
        .insertInto('Entity')
        .values(dbData)
        .returning('id')
        .executeTakeFirstOrThrow();

      const entityId = entityResult.id;

      // 2. Save Code (if provided)
      if (codeData && codeData.value) {
        const type = codeData.type || 'manual';
        await trx
          .insertInto('Code')
          .values({
            entity_id: entityId,
            code_type: type,
            code_value: codeData.value,
          })
          .execute();
      }

      // 3. Save Template Field Values
      if (templateFieldsData && Object.keys(templateFieldsData).length > 0) {
        for (const [fieldId, value] of Object.entries(templateFieldsData)) {
          if (value === null || value === undefined || value === '') continue;

          await trx
            .insertInto('CustomFieldValue')
            .values({
              entity_id: entityId,
              custom_field_id: Number(fieldId),
              field_value: typeof value === 'object' ? JSON.stringify(value) : String(value),
            })
            .execute();
        }
      }

      // 4. Handle Ad-Hoc Attributes (Create Field definition -> Save Value)
      if (adHocAttributes && adHocAttributes.length > 0) {
        for (const [idx, attr] of adHocAttributes.entries()) {
          // 4a. Create the CustomField definition linked to this specific entity
          const fieldResult = await trx
            .insertInto('CustomField')
            .values({
              entity_id: entityId,
              field_name: attr.name,
              field_type: attr.type,
              options: JSON.stringify(attr.options) || '',
              is_required: attr.required ? 1 : 0,
              sort_order: idx,
            })
            .returning('id')
            .executeTakeFirstOrThrow();

          const customFieldId = fieldResult.id;
          let fieldValueToSave = '';

          // 4b. Handle specific logic for files/images vs simple text
          if (
            (attr.type === 'image' || attr.type === 'file') &&
            attr.savedFiles &&
            attr.savedFiles.length > 0
          ) {
            const fileIds = [];
            for (const fileObj of attr.savedFiles) {
              const fileDbResult = await trx
                .insertInto('File')
                .values({
                  entity_id: entityId,
                  file_path: fileObj.path,
                  file_name: fileObj.name,
                  mime_type: fileObj.type,
                  is_primary: fileObj.isPrimary ? 1 : 0,
                })
                .returning('id')
                .executeTakeFirstOrThrow();
              fileIds.push(fileDbResult.id);
            }
            fieldValueToSave = JSON.stringify(fileIds);
          } else {
            fieldValueToSave =
              typeof attr.value === 'object'
                ? JSON.stringify(attr.value)
                : String(attr.value || '');
          }

          // 4c. Save the value
          await trx
            .insertInto('CustomFieldValue')
            .values({
              entity_id: entityId,
              custom_field_id: customFieldId,
              field_value: fieldValueToSave,
            })
            .execute();
        }
      }

      return entityId;
    });
  }

  /**
   * Retrieves all non-archived entities, optionally filtered by type.
   * @param {string|null} type - 'item', 'category', or 'place'.
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
   * Finds an entity by ID.
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
   * Finds a single entity matching the criteria.
   * @param {Object} criteria
   * @returns {Promise<Entity|null>}
   */
  async findOneBy(criteria) {
    let query = db.selectFrom('Entity');
    query = this._applyCriteria(query, criteria);

    const result = await query.selectAll().executeTakeFirst();
    return result ? new Entity(result) : null;
  }

  /**
   * Finds all entities matching the criteria.
   * @param {Object} criteria
   * @returns {Promise<Entity[]>}
   */
  async findBy(criteria) {
    let query = db.selectFrom('Entity');
    query = this._applyCriteria(query, criteria);

    const results = await query.selectAll().execute();
    return results.map((row) => new Entity(row));
  }

  /**
   * Saves or Updates an Entity.
   * On update, it preserves the original 'created_at' timestamp.
   * @param {Entity} entity
   * @returns {Promise<number>} ID of the saved entity.
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
      return Number(result.insertId);
    }
  }

  /**
   * Deletes an entity by ID.
   * Note: Triggers defined in DB initialization handle the cleanup of EntitySearch.
   * @param {Entity|number} entity
   */
  async remove(entity) {
    const id = typeof entity.getId === 'function' ? entity.getId() : entity.id || entity;
    await db.deleteFrom('Entity').where('id', '=', id).execute();
  }

  /**
   * Finds child entities for a given parent.
   * @param {number} parentId
   * @param {string|null} type
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
   * Performs a Full Text Search using the virtual EntitySearch table.
   * @param {string} searchTerm
   * @param {string|null} type
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
      // Use MATCH operator on the virtual table
      .where(sql`EntitySearch`, 'match', ftsQuery);

    if (type) {
      query = query.where('e.type', '=', type);
    }

    // Sort by rank (relevance) provided by FTS5
    const results = await query.orderBy(sql`rank`).execute();

    return results.map((row) => new Entity(row));
  }

  /**
   * Counts entities matching criteria.
   * @param {Object} criteria
   * @returns {Promise<number>}
   */
  async count(criteria = {}) {
    let query = db.selectFrom('Entity');
    query = this._applyCriteria(query, criteria);

    const result = await query.select((eb) => eb.fn.count('id').as('count')).executeTakeFirst();
    return Number(result.count);
  }

  /**
   * Finds an entity linked to a specific barcode/NFC code.
   * @param {string} codeValue
   * @returns {Promise<Entity|null>}
   */
  async findByCode(codeValue) {
    const result = await db
      .selectFrom('Code')
      .innerJoin('Entity', 'Entity.id', 'Code.entity_id')
      .where('Code.code_value', '=', codeValue)
      .selectAll('Entity')
      .executeTakeFirst();

    return result ? new Entity(result) : null;
  }

  /**
   * Finds active (not archived) entities that have an 'expiry_date' field
   * falling within the next 3 days.
   * @returns {Promise<Entity[]>}
   */
  async findExpiringIn3Days() {
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);

    const results = await db
      .selectFrom('Entity as e')
      .innerJoin('CustomField as cf', 'cf.entity_id', 'e.id')
      .innerJoin('CustomFieldValue as cfv', (join) =>
        join.onRef('cfv.custom_field_id', '=', 'cf.id').onRef('cfv.entity_id', '=', 'e.id'),
      )
      .where('cf.field_type', '=', 'expiry_date')
      .where('cf.is_archived', '=', 0)
      .where('e.is_archived', '=', 0)
      .where((eb) =>
        eb('cfv.field_value', '>=', today.toISOString().slice(0, 10)).and(
          'cfv.field_value',
          '<=',
          threeDaysLater.toISOString().slice(0, 10),
        ),
      )
      .selectAll('e')
      .execute();

    return results.map((row) => new Entity(row));
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

export const entityRepository = new EntityRepository();
