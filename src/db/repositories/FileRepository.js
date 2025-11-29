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
      const result = await db
        .updateTable('File')
        .set(data)
        .where('id', '=', file.getId())
        .executeTakeFirst();

      return file.getId();
    } else {
      const result = await db.insertInto('File').values(data).executeTakeFirst();

      return result.insertId;
    }
  }

  async remove(file) {
    await db.deleteFrom('File').where('id', '=', file.getId()).execute();
  }

  async setPrimary(file) {
    // Usuń primary ze wszystkich plików tej encji
    await db
      .updateTable('File')
      .set({ is_primary: 0 })
      .where('entity_id', '=', file.getEntityId())
      .execute();

    // Ustaw ten plik jako primary
    file.setIsPrimary(true);
    return await this.save(file);
  }
}

export const fileRepository = new FileRepository();
