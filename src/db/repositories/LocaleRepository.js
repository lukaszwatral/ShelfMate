import { db } from '../database.js';
import { Locale } from '../models/Locale.js';

export class LocaleRepository {
  async findAll() {
    const results = await db.selectFrom('Locale').selectAll().execute();

    return results.map((row) => new Locale(row));
  }

  /**
   * Znajduje ustawienie po kluczu (klucz to PRIMARY KEY)
   * @param {string} code
   * @returns {Promise<Locale|null>}
   */
  async find(code) {
    const result = await db
      .selectFrom('Locale')
      .where('code', '=', code)
      .selectAll()
      .executeTakeFirst();

    return result ? new Locale(result) : null;
  }

  async findOneBy(criteria) {
    let query = db.selectFrom('Locale');

    Object.entries(criteria).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      query = query.where(snakeKey, '=', value);
    });

    const result = await query.selectAll().executeTakeFirst();
    return result ? new Locale(result) : null;
  }

  async findBy(criteria) {
    let query = db.selectFrom('Locale');

    Object.entries(criteria).forEach(([key, value]) => {
      query = query.where(key, '=', value);
    });

    const results = await query.selectAll().execute();
    return results.map((row) => new Locale(row));
  }

  async save(locale) {
    const data = locale.toDatabase();

    // Upsert - insert lub update po kluczu
    const result = await db
      .insertInto('Locale')
      .values(data)
      .onConflict((oc) => oc.column('code').doUpdateSet({ name: data.name }))
      .executeTakeFirst();

    return result.insertId;
  }

  async remove(locale) {
    await db.deleteFrom('Locale').where('code', '=', locale.getCode()).execute();
  }

  /**
   * Pobiera wartość ustawienia (shortcut)
   * @param {string} code
   * @returns {Promise<Locale|null>}
   */
  async getValue(code) {
    const locale = await this.find(code);
    return locale ? locale.getName() : null;
  }

  /**
   * Ustawia wartość (shortcut)
   * @param {string} code
   * @param {string} name
   * @returns {Locale<Setting>}
   */
  async setValue(code, name) {
    const locale = new Locale({ code, name });
    return await this.save(locale);
  }

  /**
   * Pobiera wiele ustawień jako obiekt klucz-wartość
   * @param {string[]} codes
   * @returns {Promise<Object>}
   */
  async getMultiple(codes) {
    const results = await db.selectFrom('Locale').where('key', 'in', codes).selectAll().execute();

    const locales = {};
    results.forEach((row) => {
      locales[row.code] = row.name;
    });

    return locales;
  }

  /**
   * Ustawia wiele wartości naraz
   * @param {Object} codeNamePairs
   */
  async setMultiple(codeNamePairs) {
    const promises = Object.entries(codeNamePairs).map(([code, name]) => this.setValue(code, name));

    await Promise.all(promises);
  }

  async count() {
    const result = await db
      .selectFrom('Locale')
      .select((eb) => eb.fn.count('code').as('count'))
      .executeTakeFirst();

    return Number(result.count);
  }
}

export const localeRepository = new LocaleRepository();
