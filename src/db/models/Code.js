export class Code {
  constructor(data = {}) {
    this.id = data.id || null;
    this.entityId = data.entity_id || data.entityId || null;
    this.codeType = data.code_type || data.codeType || null;
    this.codeValue = data.code_value || data.codeValue || '';
    this.createdAt = data.created_at || data.createdAt || null;
  }

  getId() {
    return this.id;
  }
  getEntityId() {
    return this.entityId;
  }
  getCodeType() {
    return this.codeType;
  }
  getCodeValue() {
    return this.codeValue;
  }
  getCreatedAt() {
    return this.createdAt;
  }

  setEntityId(value) {
    this.entityId = value;
    return this;
  }
  setCodeType(value) {
    this.codeType = value;
    return this;
  }
  setCodeValue(value) {
    this.codeValue = value;
    return this;
  }

  toDatabase() {
    return {
      entity_id: this.entityId,
      code_type: this.codeType,
      code_value: this.codeValue,
    };
  }
}
