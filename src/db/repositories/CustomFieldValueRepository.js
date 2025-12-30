import { db } from '../database.js';
import { CustomFieldValue } from '../models/CustomFieldValue.js';

export class CustomFieldValueRepository {
  async findAll() {
    const results = await db.selectFrom('CustomFieldValue').selectAll().execute();
    return results.map((row) => new CustomFieldValue(row));
  }

  async find(id) {
    const result = await db
      .selectFrom('CustomFieldValue')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();
    return result ? new CustomFieldValue(result) : null;
  }

  async findOneBy(criteria) {
    let query = db.selectFrom('CustomFieldValue');
    Object.entries(criteria).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      query = query.where(snakeKey, '=', value);
    });
    const result = await query.selectAll().executeTakeFirst();
    return result ? new CustomFieldValue(result) : null;
  }

  async findBy(criteria) {
    let query = db.selectFrom('CustomFieldValue');
    Object.entries(criteria).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      query = query.where(snakeKey, '=', value);
    });
    const results = await query.selectAll().execute();
    return results.map((row) => new CustomFieldValue(row));
  }

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
      return result.insertId;
    }
  }

  async remove(customFieldValue) {
    const id =
      typeof customFieldValue.getId === 'function' ? customFieldValue.getId() : customFieldValue.id;
    await db.deleteFrom('CustomFieldValue').where('id', '=', id).execute();
  }

  async findByEntity(entityId) {
    const results = await db
      .selectFrom('CustomFieldValue')
      .where('entity_id', '=', entityId)
      .selectAll()
      .execute();
    return results.map((row) => new CustomFieldValue(row));
  }

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

  async setFieldValue(entityId, customFieldId, value) {
    const fieldValue = new CustomFieldValue({
      entity_id: entityId,
      custom_field_id: customFieldId,
      field_value: value,
    });
    return await this.save(fieldValue);
  }

  async removeByEntity(entityId) {
    await db.deleteFrom('CustomFieldValue').where('entity_id', '=', entityId).execute();
  }

  async count(criteria = {}) {
    let query = db.selectFrom('CustomFieldValue');
    Object.entries(criteria).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      query = query.where(snakeKey, '=', value);
    });
    const result = await query.select((eb) => eb.fn.count('id').as('count')).executeTakeFirst();
    return Number(result.count);
  }
}

export const customFieldValueRepository = new CustomFieldValueRepository();
