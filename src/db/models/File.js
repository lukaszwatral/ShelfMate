/**
 * Represents a file attachment linked to an Entity (e.g., an image or document).
 */
export class File {
  constructor(data = {}) {
    this.id = data.id || null;
    this.entityId = data.entity_id || data.entityId || null;
    this.filePath = data.file_path || data.filePath || '';
    this.fileName = data.file_name || data.fileName || '';
    this.mimeType = data.mime_type || data.mimeType || null;
    this.isPrimary = data.is_primary || data.isPrimary || false;
    this.thumbnailPath = data.thumbnail_path || data.thumbnailPath || null;
    this.createdAt = data.created_at || data.createdAt || null;
  }

  getId() {
    return this.id;
  }
  getEntityId() {
    return this.entityId;
  }
  getFilePath() {
    return this.filePath;
  }
  getFileName() {
    return this.fileName;
  }
  getMimeType() {
    return this.mimeType;
  }
  getIsPrimary() {
    return this.isPrimary;
  }
  getThumbnailPath() {
    return this.thumbnailPath;
  }
  getCreatedAt() {
    return this.createdAt;
  }

  setEntityId(value) {
    this.entityId = value;
    return this;
  }
  setFilePath(value) {
    this.filePath = value;
    return this;
  }
  setFileName(value) {
    this.fileName = value;
    return this;
  }
  setMimeType(value) {
    this.mimeType = value;
    return this;
  }
  setIsPrimary(value) {
    this.isPrimary = value;
    return this;
  }
  setThumbnailPath(value) {
    this.thumbnailPath = value;
    return this;
  }

  /**
   * Converts the model instance to a database-compatible object (snake_case).
   * Handles boolean to integer conversion for SQLite (0/1).
   * @returns {Object}
   */
  toDatabase() {
    return {
      entity_id: this.entityId,
      file_path: this.filePath,
      file_name: this.fileName,
      mime_type: this.mimeType,
      is_primary: this.isPrimary ? 1 : 0,
      thumbnail_path: this.thumbnailPath,
    };
  }
}
