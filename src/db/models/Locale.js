/**
 * Represents a supported system locale/language.
 */
export class Locale {
  constructor(data = {}) {
    this.code = data.code || '';
    this.name = data.name || null;
    this.updatedAt = data.updated_at || data.updatedAt || null;
  }

  getCode() {
    return this.code;
  }
  getName() {
    return this.name;
  }
  getUpdatedAt() {
    return this.updatedAt;
  }

  setCode(value) {
    this.code = value;
    return this;
  }
  setName(value) {
    this.name = value;
    return this;
  }

  /**
   * Converts the model instance to a database-compatible object.
   * @returns {Object}
   */
  toDatabase() {
    return {
      code: this.code,
      name: this.name,
    };
  }
}
