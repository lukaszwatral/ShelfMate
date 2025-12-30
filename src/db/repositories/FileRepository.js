import { db } from '../database.js';
import { File } from '../models/File.js';

export class FileRepository {
  async findAll() {
    const results = await db.selectFrom('File').selectAll().execute();
    return results.map((row) => new File(row));
  }

  async find(id) {
    const result = await db.selectFrom('File').where('id', '=', id).selectAll().executeTakeFirst();
    return result ? new File(result) : null;
  }

  async findBy(criteria) {
    let query = db.selectFrom('File');
    Object.entries(criteria).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      query = query.where(snakeKey, '=', value);
    });
    const results = await query.selectAll().execute();
    return results.map((row) => new File(row));
  }

  async save(file) {
    const data = file.toDatabase();

    if (file.getId()) {
      await db.updateTable('File').set(data).where('id', '=', file.getId()).executeTakeFirst();
      return file.getId();
    } else {
      const result = await db.insertInto('File').values(data).executeTakeFirst();
      return result.insertId;
    }
  }

  async remove(file) {
    const id = typeof file.getId === 'function' ? file.getId() : file.id;
    await db.deleteFrom('File').where('id', '=', id).execute();
  }

  async setPrimary(file) {
    return await db.transaction().execute(async (trx) => {
      await trx
        .updateTable('File')
        .set({ is_primary: 0 })
        .where('entity_id', '=', file.getEntityId())
        .execute();

      await trx.updateTable('File').set({ is_primary: 1 }).where('id', '=', file.getId()).execute();

      file.setIsPrimary(true);
      return file.getId();
    });
  }
}

export const fileRepository = new FileRepository();
