import { db } from '../database.js';
import { Locale } from '../models/Locale.js';

export class LocaleRepository {
  /**
   * Retrieves all available locales.
   * @returns {Promise<Locale[]>}
   */
  async findAll() {
    const results = await db.selectFrom('Locale').selectAll().execute();
    return results.map((row) => new Locale(row));
  }

  /**
   * Finds a locale by its unique code (Primary Key).
   * @param {string} code - e.g., 'en', 'pl'.
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

  /**
   * Finds a single locale matching the criteria.
   * @param {Object} criteria
   * @returns {Promise<Locale|null>}
   */
  async findOneBy(criteria) {
    let query = db.selectFrom('Locale');
    query = this._applyCriteria(query, criteria);

    const result = await query.selectAll().executeTakeFirst();
    return result ? new Locale(result) : null;
  }

  /**
   * Finds all locales matching the criteria.
   * @param {Object} criteria
   * @returns {Promise<Locale[]>}
   */
  async findBy(criteria) {
    let query = db.selectFrom('Locale');
    query = this._applyCriteria(query, criteria);

    const results = await query.selectAll().execute();
    return results.map((row) => new Locale(row));
  }

  /**
   * Saves or updates a locale.
   * Uses UPSERT strategy: updates the name if the code already exists.
   * @param {Locale} locale
   * @returns {Promise<bigint|number>}
   */
  async save(locale) {
    const data = locale.toDatabase();

    const result = await db
      .insertInto('Locale')
      .values(data)
      .onConflict((oc) => oc.column('code').doUpdateSet({ name: data.name }))
      .executeTakeFirst();

    return result.insertId;
  }

  /**
   * Removes a locale by its code.
   * @param {Locale} locale
   */
  async remove(locale) {
    await db.deleteFrom('Locale').where('code', '=', locale.getCode()).execute();
  }

  /**
   * Shortcut to get the name of a locale directly.
   * @param {string} code
   * @returns {Promise<string|null>} The name of the locale or null.
   */
  async getValue(code) {
    const locale = await this.find(code);
    return locale ? locale.getName() : null;
  }

  /**
   * Creates or updates a locale with a specific code and name.
   * @param {string} code
   * @param {string} name
   * @returns {Promise<bigint|number>}
   */
  async setValue(code, name) {
    const locale = new Locale({ code, name });
    return await this.save(locale);
  }

  /**
   * Retrieves multiple locales by their codes.
   * @param {string[]} codes - Array of locale codes.
   * @returns {Promise<Object>} Object map { code: name }.
   */
  async getMultiple(codes) {
    // Fixed bug: changed 'key' to 'code' column
    const results = await db.selectFrom('Locale').where('code', 'in', codes).selectAll().execute();

    const locales = {};
    results.forEach((row) => {
      locales[row.code] = row.name;
    });

    return locales;
  }

  /**
   * Sets multiple locales at once.
   * @param {Object} codeNamePairs - Object map { code: name }.
   */
  async setMultiple(codeNamePairs) {
    const promises = Object.entries(codeNamePairs).map(([code, name]) => this.setValue(code, name));
    await Promise.all(promises);
  }

  /**
   * Counts total number of locales.
   * @returns {Promise<number>}
   */
  async count() {
    const result = await db
      .selectFrom('Locale')
      .select((eb) => eb.fn.count('code').as('count'))
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

export const localeRepository = new LocaleRepository();
