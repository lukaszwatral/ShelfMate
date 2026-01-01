import { db } from '../database.js';
import { sql } from 'kysely';
import { Entity } from '../models/Entity.js';

/**
 * Helper: Przygotowuje bezpieczne zapytanie dla FTS5.
 */
function prepareSearchQuery(query) {
  if (!query) return '';
  const sanitized = query.replace(/[^a-zA-Z0-9\s\p{L}]/gu, '').trim();
  if (!sanitized) return '';
  return sanitized
    .split(/\s+/)
    .map((term) => `"${term}"*`)
    .join(' ');
}

export class EntityRepository {
  /**
   * Tworzy encję wraz ze wszystkimi powiązanymi danymi w jednej transakcji.
   */
  async createWithRelatedData(entityData, codeData, templateFieldsData, adHocAttributes) {
    return await db.transaction().execute(async (trx) => {
      // 1. Zapisz Entity
      // Pobieramy dane przygotowane przez klasę Entity (toDatabase handles logic like isArchived -> 1/0)
      const dbData = entityData.toDatabase();

      // Usuwamy ID (auto-increment) i daty (baza ustawi defaulty)
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

      // 2. Zapisz Kod
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

      // 3. Zapisz Pola z szablonu
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

      // 4. Obsługa atrybutów ad-hoc
      if (adHocAttributes && adHocAttributes.length > 0) {
        for (const [idx, attr] of adHocAttributes.entries()) {
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

  async findAll(type = null) {
    let query = db.selectFrom('Entity').selectAll();

    if (type) {
      query = query.where('type', '=', type);
    }

    const results = await query.where('is_archived', '=', 0).orderBy('sort_order', 'asc').execute();

    // Twój konstruktor Entity obsłuży mapowanie snake_case -> camelCase
    return results.map((row) => new Entity(row));
  }

  async find(id) {
    const result = await db
      .selectFrom('Entity')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();

    return result ? new Entity(result) : null;
  }

  async findOneBy(criteria) {
    let query = db.selectFrom('Entity');

    Object.entries(criteria).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      query = query.where(snakeKey, '=', value);
    });

    const result = await query.selectAll().executeTakeFirst();
    return result ? new Entity(result) : null;
  }

  async findBy(criteria) {
    let query = db.selectFrom('Entity');

    Object.entries(criteria).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      query = query.where(snakeKey, '=', value);
    });

    const results = await query.selectAll().execute();
    return results.map((row) => new Entity(row));
  }

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

  async remove(entity) {
    const id = typeof entity.getId === 'function' ? entity.getId() : entity.id;

    await db.deleteFrom('Entity').where('id', '=', id).execute();
    await sql`DELETE FROM EntitySearch WHERE entity_id = ${id}`.execute(db);
  }

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

  async search(searchTerm, type = null) {
    const ftsQuery = prepareSearchQuery(searchTerm);

    if (!ftsQuery) return [];

    let query = db
      .selectFrom('Entity as e')
      // Join with virtual FTS table
      .innerJoin('EntitySearch as es', 'es.entity_id', 'e.id')
      .selectAll('e')
      // Use MATCH operator
      .where(sql`EntitySearch`, 'match', ftsQuery);

    if (type) {
      query = query.where('e.type', '=', type);
    }

    // Sort by rank (relevance)
    const results = await query.orderBy(sql`rank`).execute();

    return results.map((row) => new Entity(row));
  }

  async count(criteria = {}) {
    let query = db.selectFrom('Entity');

    Object.entries(criteria).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      query = query.where(snakeKey, '=', value);
    });

    const result = await query.select((eb) => eb.fn.count('id').as('count')).executeTakeFirst();

    return Number(result.count);
  }

  async findByCode(codeValue) {
    const result = await db
      .selectFrom('Code')
      .innerJoin('Entity', 'Entity.id', 'Code.entity_id')
      .where('Code.code_value', '=', codeValue)
      .selectAll('Entity')
      .executeTakeFirst();

    return result ? new Entity(result) : null;
  }

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
}

export const entityRepository = new EntityRepository();
