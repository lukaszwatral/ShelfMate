import { db } from '../database.js';
import { File } from '../models/File.js';

export class FileRepository {
  /**
   * Retrieves all file records.
   * @returns {Promise<File[]>}
   */
  async findAll() {
    const results = await db.selectFrom('File').selectAll().execute();
    return results.map((row) => new File(row));
  }

  /**
   * Finds a file by its ID.
   * @param {number} id
   * @returns {Promise<File|null>}
   */
  async find(id) {
    const result = await db.selectFrom('File').where('id', '=', id).selectAll().executeTakeFirst();
    return result ? new File(result) : null;
  }

  /**
   * Finds files matching specific criteria.
   * @param {Object} criteria - Key-value pairs for filtering.
   * @returns {Promise<File[]>}
   */
  async findBy(criteria) {
    let query = db.selectFrom('File');
    query = this._applyCriteria(query, criteria);

    const results = await query.selectAll().execute();
    return results.map((row) => new File(row));
  }

  /**
   * Saves or updates a file record.
   * @param {File} file
   * @returns {Promise<number>} ID of the saved file.
   */
  async save(file) {
    const data = file.toDatabase();

    if (file.getId()) {
      await db.updateTable('File').set(data).where('id', '=', file.getId()).executeTakeFirst();
      return file.getId();
    } else {
      const result = await db.insertInto('File').values(data).executeTakeFirst();
      return Number(result.insertId);
    }
  }

  /**
   * Deletes a file record.
   * @param {File|number} file - Model instance or ID.
   */
  async remove(file) {
    const id = typeof file.getId === 'function' ? file.getId() : file.id || file;
    await db.deleteFrom('File').where('id', '=', id).execute();
  }

  /**
   * Sets a specific file as primary (e.g., main thumbnail) for an entity.
   * Uses a transaction to ensure all other files for this entity are unset first.
   * @param {File} file
   * @returns {Promise<number>} The ID of the file set as primary.
   */
  async setPrimary(file) {
    return await db.transaction().execute(async (trx) => {
      // 1. Reset 'is_primary' for all files belonging to this entity
      await trx
        .updateTable('File')
        .set({ is_primary: 0 })
        .where('entity_id', '=', file.getEntityId())
        .execute();

      // 2. Set 'is_primary' for the target file
      await trx.updateTable('File').set({ is_primary: 1 }).where('id', '=', file.getId()).execute();

      // 3. Update local model state
      file.setIsPrimary(true);

      return file.getId();
    });
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

export const fileRepository = new FileRepository();
