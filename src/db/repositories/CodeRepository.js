import { db } from '../database.js';
import { Code } from '../models/Code.js';
import { Entity } from '../models/Entity.js';

export class CodeRepository {
  /**
   * Retrieves all code records.
   * @returns {Promise<Code[]>}
   */
  async findAll() {
    const results = await db.selectFrom('Code').selectAll().execute();
    return results.map((row) => new Code(row));
  }

  /**
   * Finds a specific code by its ID.
   * @param {number} id
   * @returns {Promise<Code|null>}
   */
  async find(id) {
    const result = await db.selectFrom('Code').where('id', '=', id).selectAll().executeTakeFirst();
    return result ? new Code(result) : null;
  }

  /**
   * Finds codes matching specific criteria.
   * Automatically converts camelCase keys to snake_case column names.
   * @param {Object} criteria - Key-value pairs to filter by.
   * @returns {Promise<Code[]>}
   */
  async findBy(criteria) {
    let query = db.selectFrom('Code');

    Object.entries(criteria).forEach(([key, value]) => {
      // Convert camelCase (JS) to snake_case (DB)
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      query = query.where(snakeKey, '=', value);
    });

    const results = await query.selectAll().execute();
    return results.map((row) => new Code(row));
  }

  /**
   * Saves a code record. Performs an INSERT if ID is missing, otherwise UPDATE.
   * @param {Code} code
   * @returns {Promise<number>} The ID of the saved record.
   */
  async save(code) {
    const data = code.toDatabase();

    if (code.getId()) {
      await db.updateTable('Code').set(data).where('id', '=', code.getId()).executeTakeFirst();
      return code.getId();
    } else {
      const result = await db.insertInto('Code').values(data).executeTakeFirst();
      return Number(result.insertId);
    }
  }

  /**
   * Removes a code record from the database.
   * @param {Code|Object|number} code - The model instance, data object, or ID.
   */
  async remove(code) {
    const id = typeof code.getId === 'function' ? code.getId() : code.id || code;
    await db.deleteFrom('Code').where('id', '=', id).execute();
  }

  /**
   * Finds the parent Entity associated with a specific code type and value.
   * Uses a JOIN for performance.
   * @param {string} codeType
   * @param {string} codeValue
   * @returns {Promise<Entity|null>}
   */
  async findEntityByCode(codeType, codeValue) {
    const result = await db
      .selectFrom('Code')
      .innerJoin('Entity', 'Entity.id', 'Code.entity_id')
      .where('Code.code_type', '=', codeType)
      .where('Code.code_value', '=', codeValue)
      .selectAll('Entity')
      .executeTakeFirst();

    return result ? new Entity(result) : null;
  }

  /**
   * Finds an Entity by code value regardless of the code type.
   * Useful for global search/scan where type might be unknown or inferred.
   * @param {string} codeValue
   * @returns {Promise<Entity|null>}
   */
  async findEntityByValueOnly(codeValue) {
    const result = await db
      .selectFrom('Code')
      .innerJoin('Entity', 'Entity.id', 'Code.entity_id')
      .where('Code.code_value', '=', codeValue)
      .selectAll('Entity')
      .executeTakeFirst();

    return result ? new Entity(result) : null;
  }
}

export const codeRepository = new CodeRepository();
