/**
 * Represents a global application configuration key-value pair.
 */
export class Setting {
  constructor(data = {}) {
    this.key = data.key || '';
    this.value = data.value || null;
    this.updatedAt = data.updated_at || data.updatedAt || null;
  }

  getKey() {
    return this.key;
  }
  getValue() {
    return this.value;
  }
  getUpdatedAt() {
    return this.updatedAt;
  }

  setKey(value) {
    this.key = value;
    return this;
  }
  setValue(value) {
    this.value = value;
    return this;
  }

  /**
   * Converts the model instance to a database-compatible object.
   * @returns {Object}
   */
  toDatabase() {
    return {
      key: this.key,
      value: this.value,
    };
  }
}
