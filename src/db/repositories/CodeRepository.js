import { db } from '../database.js';
import { Code } from '../models/Code.js';
import { Entity } from '../models/Entity.js';

export class CodeRepository {
  async findAll() {
    const results = await db.selectFrom('Code').selectAll().execute();
    return results.map((row) => new Code(row));
  }

  async find(id) {
    const result = await db.selectFrom('Code').where('id', '=', id).selectAll().executeTakeFirst();

    return result ? new Code(result) : null;
  }

  async findBy(criteria) {
    let query = db.selectFrom('Code');

    Object.entries(criteria).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      query = query.where(snakeKey, '=', value);
    });

    const results = await query.selectAll().execute();
    return results.map((row) => new Code(row));
  }

  async save(code) {
    const data = code.toDatabase();

    if (code.getId()) {
      const result = await db
        .updateTable('Code')
        .set(data)
        .where('id', '=', code.getId())
        .returningAll()
        .executeTakeFirst();

      return new Code(result);
    } else {
      const result = await db.insertInto('Code').values(data).returningAll().executeTakeFirst();

      return new Code(result);
    }
  }

  async remove(code) {
    await db.deleteFrom('Code').where('id', '=', code.getId()).execute();
  }

  async findEntityByCode(codeValue, codeType = 'qr') {
    const result = await db
      .selectFrom('Code')
      .where('code_value', '=', codeValue)
      .where('code_type', '=', codeType)
      .selectAll()
      .executeTakeFirst();

    if (!result) return null;

    const entityResult = await db
      .selectFrom('Entity')
      .where('id', '=', result.entity_id)
      .selectAll()
      .executeTakeFirst();

    return entityResult ? new Entity(entityResult) : null;
  }
}

export const codeRepository = new CodeRepository();
