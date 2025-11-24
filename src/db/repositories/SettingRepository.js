import { db } from '../database.js';
import { Setting } from '../models/Setting.js';

export class SettingRepository {
  async findAll() {
    const results = await db.selectFrom('Setting').selectAll().execute();

    return results.map((row) => new Setting(row));
  }

  /**
   * Znajduje ustawienie po kluczu (klucz to PRIMARY KEY)
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

  async findOneBy(criteria) {
    let query = db.selectFrom('Setting');

    Object.entries(criteria).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      query = query.where(snakeKey, '=', value);
    });

    const result = await query.selectAll().executeTakeFirst();
    return result ? new Setting(result) : null;
  }

  async findBy(criteria) {
    let query = db.selectFrom('Setting');

    Object.entries(criteria).forEach(([key, value]) => {
      query = query.where(key, '=', value);
    });

    const results = await query.selectAll().execute();
    return results.map((row) => new Setting(row));
  }

  async save(setting) {
    const data = setting.toDatabase();

    // Upsert - insert lub update po kluczu
    const result = await db
      .insertInto('Setting')
      .values(data)
      .onConflict((oc) => oc.column('key').doUpdateSet({ value: data.value }))
      .execute();

    return new Setting(result);
  }

  async remove(setting) {
    await db.deleteFrom('Setting').where('key', '=', setting.getKey()).execute();
  }

  /**
   * Pobiera wartość ustawienia (shortcut)
   * @param {string} key
   * @returns {Promise<string|null>}
   */
  async getValue(key) {
    const setting = await this.find(key);
    return setting ? setting.getValue() : null;
  }

  /**
   * Ustawia wartość (shortcut)
   * @param {string} key
   * @param {string} value
   * @returns {Promise<Setting>}
   */
  async setValue(key, value) {
    const setting = new Setting({ key, value });
    return await this.save(setting);
  }

  /**
   * Pobiera wiele ustawień jako obiekt klucz-wartość
   * @param {string[]} keys
   * @returns {Promise<Object>}
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
   * Ustawia wiele wartości naraz
   * @param {Object} keyValuePairs
   */
  async setMultiple(keyValuePairs) {
    const promises = Object.entries(keyValuePairs).map(([key, value]) => this.setValue(key, value));

    await Promise.all(promises);
  }

  async count() {
    const result = await db
      .selectFrom('Setting')
      .select((eb) => eb.fn.count('key').as('count'))
      .executeTakeFirst();

    return Number(result.count);
  }
}

export const settingRepository = new SettingRepository();
