export class CustomField {
  constructor(data = {}) {
    this.id = data.id || null;
    this.categoryTemplateId = data.category_template_id || data.categoryTemplateId || null;
    this.entityId = data.entity_id || data.entityId || null;
    this.fieldName = data.field_name || data.fieldName || '';
    this.fieldType = data.field_type || data.fieldType || 'text';
    this.isRequired = data.is_required || data.isRequired || false;
    this.defaultValue = data.default_value || data.defaultValue || null;
    this.options = data.options || null;
    this.sortOrder = data.sort_order || data.sortOrder || null;
    this.isArchived = data.is_archived || data.isArchived || false;
    this.createdAt = data.created_at || data.createdAt || null;
    this.updatedAt = data.updated_at || data.updatedAt || null;
  }

  getId() {
    return this.id;
  }
  getCategoryTemplateId() {
    return this.categoryTemplateId;
  }
  getEntityId() {
    return this.entityId;
  }
  getFieldName() {
    return this.fieldName;
  }
  getFieldType() {
    return this.fieldType;
  }
  getIsRequired() {
    return this.isRequired;
  }
  getDefaultValue() {
    return this.defaultValue;
  }
  getOptions() {
    return this.options;
  }
  getSortOrder() {
    return this.sortOrder;
  }
  getIsArchived() {
    return this.isArchived;
  }
  getCreatedAt() {
    return this.createdAt;
  }
  getUpdatedAt() {
    return this.updatedAt;
  }

  setCategoryTemplateId(value) {
    this.categoryTemplateId = value;
    return this;
  }
  setEntityId(value) {
    this.entityId = value;
    return this;
  }
  setFieldName(value) {
    this.fieldName = value;
    return this;
  }
  setFieldType(value) {
    this.fieldType = value;
    return this;
  }
  setIsRequired(value) {
    this.isRequired = value;
    return this;
  }
  setDefaultValue(value) {
    this.defaultValue = value;
    return this;
  }
  setOptions(value) {
    this.options = value;
    return this;
  }
  setSortOrder(value) {
    this.sortOrder = value;
    return this;
  }
  setIsArchived(value) {
    this.isArchived = value;
    return this;
  }

  toDatabase() {
    return {
      category_template_id: this.categoryTemplateId,
      entity_id: this.entityId,
      field_name: this.fieldName,
      field_type: this.fieldType,
      is_required: this.isRequired ? 1 : 0,
      default_value: this.defaultValue,
      options: this.options,
      sort_order: this.sortOrder,
      is_archived: this.isArchived ? 1 : 0,
    };
  }
}
