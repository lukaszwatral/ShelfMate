import { db } from '../database.js';
import { Tag } from '../models/Tag.js';

export class TagRepository {
  async findAll() {
    const results = await db.selectFrom('Tag').selectAll().orderBy('name', 'asc').execute();

    return results.map((row) => new Tag(row));
  }

  async find(id) {
    const result = await db.selectFrom('Tag').where('id', '=', id).selectAll().executeTakeFirst();

    return result ? new Tag(result) : null;
  }

  async findOneBy(criteria) {
    let query = db.selectFrom('Tag');

    Object.entries(criteria).forEach(([key, value]) => {
      query = query.where(key, '=', value);
    });

    const result = await query.selectAll().executeTakeFirst();
    return result ? new Tag(result) : null;
  }

  async findBy(criteria) {
    let query = db.selectFrom('Tag');

    Object.entries(criteria).forEach(([key, value]) => {
      query = query.where(key, '=', value);
    });

    const results = await query.selectAll().execute();
    return results.map((row) => new Tag(row));
  }

  async save(tag) {
    const data = tag.toDatabase();

    if (tag.getId()) {
      const result = await db
        .updateTable('Tag')
        .set(data)
        .where('id', '=', tag.getId())
        .executeTakeFirst();

      return tag.getId();
    } else {
      const result = await db.insertInto('Tag').values(data).executeTakeFirst();

      return result.insertId;
    }
  }

  async remove(tag) {
    await db.deleteFrom('Tag').where('id', '=', tag.getId()).execute();
  }

  // Relacje z encjami
  async findEntityTags(entityId) {
    const results = await db
      .selectFrom('EntityTag')
      .innerJoin('Tag', 'Tag.id', 'EntityTag.tag_id')
      .where('EntityTag.entity_id', '=', entityId)
      .select(['Tag.id', 'Tag.name', 'Tag.color', 'Tag.icon', 'Tag.created_at'])
      .execute();

    return results.map((row) => new Tag(row));
  }

  async addToEntity(tag, entityId) {
    await db.insertInto('EntityTag').values({ entity_id: entityId, tag_id: tag.getId() }).execute();
  }

  async removeFromEntity(tag, entityId) {
    await db
      .deleteFrom('EntityTag')
      .where('entity_id', '=', entityId)
      .where('tag_id', '=', tag.getId())
      .execute();
  }
}

export const tagRepository = new TagRepository();
