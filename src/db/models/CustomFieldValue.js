/**
 * Represents the actual value assigned to a Custom Field for a specific Entity.
 */
export class CustomFieldValue {
  constructor(data = {}) {
    this.id = data.id || null;
    this.entityId = data.entity_id || data.entityId || null;
    this.customFieldId = data.custom_field_id || data.customFieldId || null;
    this.fieldValue = data.field_value || data.fieldValue || null;
    this.createdAt = data.created_at || data.createdAt || null;
    this.updatedAt = data.updated_at || data.updatedAt || null;
  }

  getId() {
    return this.id;
  }
  getEntityId() {
    return this.entityId;
  }
  getCustomFieldId() {
    return this.customFieldId;
  }
  getFieldValue() {
    return this.fieldValue;
  }
  getCreatedAt() {
    return this.createdAt;
  }
  getUpdatedAt() {
    return this.updatedAt;
  }

  setEntityId(value) {
    this.entityId = value;
    return this;
  }
  setCustomFieldId(value) {
    this.customFieldId = value;
    return this;
  }
  setFieldValue(value) {
    this.fieldValue = value;
    return this;
  }

  /**
   * Converts the model instance to a database-compatible object (snake_case).
   * @returns {Object}
   */
  toDatabase() {
    return {
      entity_id: this.entityId,
      custom_field_id: this.customFieldId,
      field_value: this.fieldValue,
    };
  }
}
