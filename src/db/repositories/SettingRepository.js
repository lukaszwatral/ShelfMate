import { db } from '../database.js';
import { Setting } from '../models/Setting.js';

export class SettingRepository {
  /**
   * Retrieves all settings.
   * @returns {Promise<Setting[]>}
   */
  async findAll() {
    const results = await db.selectFrom('Setting').selectAll().execute();
    return results.map((row) => new Setting(row));
  }

  /**
   * Finds a setting by its unique key (Primary Key).
   * @param {string} key
   * @returns {Promise<Setting|null>}
   */
  async find(key) {
    const result = await db
      .selectFrom('Setting')
      .where('key', '=', key)
      .selectAll()
      .executeTakeFirst();

    return result ? new Setting(result) : null;
  }

  /**
   * Finds a single setting matching the criteria.
   * @param {Object} criteria
   * @returns {Promise<Setting|null>}
   */
  async findOneBy(criteria) {
    let query = db.selectFrom('Setting');
    query = this._applyCriteria(query, criteria);

    const result = await query.selectAll().executeTakeFirst();
    return result ? new Setting(result) : null;
  }

  /**
   * Finds all settings matching the criteria.
   * @param {Object} criteria
   * @returns {Promise<Setting[]>}
   */
  async findBy(criteria) {
    let query = db.selectFrom('Setting');
    query = this._applyCriteria(query, criteria);

    const results = await query.selectAll().execute();
    return results.map((row) => new Setting(row));
  }

  /**
   * Saves or updates a setting.
   * Uses UPSERT strategy: updates the value if the key already exists.
   * @param {Setting} setting
   * @returns {Promise<string>} The key of the saved setting.
   */
  async save(setting) {
    const data = setting.toDatabase();

    await db
      .insertInto('Setting')
      .values(data)
      .onConflict((oc) => oc.column('key').doUpdateSet({ value: data.value }))
      .execute();

    return setting.getKey();
  }

  /**
   * Removes a setting by its key.
   * @param {Setting} setting
   */
  async remove(setting) {
    await db.deleteFrom('Setting').where('key', '=', setting.getKey()).execute();
  }

  /**
   * Shortcut to get the value of a setting directly.
   * @param {string} key
   * @returns {Promise<string|null>} The value of the setting or null.
   */
  async getValue(key) {
    const setting = await this.find(key);
    return setting ? setting.getValue() : null;
  }

  /**
   * Shortcut to create or update a setting value.
   * @param {string} key
   * @param {string} value
   * @returns {Promise<string>} The key of the saved setting.
   */
  async setValue(key, value) {
    const setting = new Setting({ key, value });
    return await this.save(setting);
  }

  /**
   * Retrieves multiple settings by their keys.
   * @param {string[]} keys - Array of setting keys.
   * @returns {Promise<Object>} Object map { key: value }.
   */
  async getMultiple(keys) {
    const results = await db.selectFrom('Setting').where('key', 'in', keys).selectAll().execute();

    const settings = {};
    results.forEach((row) => {
      settings[row.key] = row.value;
    });

    return settings;
  }

  /**
   * Sets multiple key-value pairs at once.
   * @param {Object} keyValuePairs - Object map { key: value }.
   */
  async setMultiple(keyValuePairs) {
    const promises = Object.entries(keyValuePairs).map(([key, value]) => this.setValue(key, value));
    await Promise.all(promises);
  }

  /**
   * Counts total number of settings.
   * @returns {Promise<number>}
   */
  async count() {
    const result = await db
      .selectFrom('Setting')
      .select((eb) => eb.fn.count('key').as('count'))
      .executeTakeFirst();

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

export const settingRepository = new SettingRepository();
