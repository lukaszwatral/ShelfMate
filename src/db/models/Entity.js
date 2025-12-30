export class Entity {
  constructor(data = {}) {
    this.id = data.id || null;
    this.type = data.type || null;
    this.parentId = data.parent_id || data.parentId || null;
    this.categoryId = data.category_id || data.categoryId || null;
    this.name = data.name || '';
    this.description = data.description || null;
    this.icon = data.icon || null;
    this.color = data.color || null;
    this.sortOrder = data.sort_order || data.sortOrder || null;
    this.isArchived = data.is_archived || data.isArchived || false;
    this.createdAt = data.created_at || data.createdAt || null;
    this.updatedAt = data.updated_at || data.updatedAt || null;
  }

  // Gettery
  getId() {
    return this.id;
  }
  getType() {
    return this.type;
  }
  getParentId() {
    return this.parentId;
  }
  getCategoryId() {
    return this.categoryId;
  }
  getName() {
    return this.name;
  }
  getDescription() {
    return this.description;
  }
  getIcon() {
    return this.icon;
  }
  getColor() {
    return this.color;
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
  // Usunięto obsługę soft delete (deleted_at)

  // Settery
  setType(value) {
    this.type = value;
    return this;
  }
  setParentId(value) {
    this.parentId = value;
    return this;
  }
  setCategoryId(value) {
    this.categoryId = value;
    return this;
  }
  setName(value) {
    this.name = value;
    return this;
  }
  setDescription(value) {
    this.description = value;
    return this;
  }
  setIcon(value) {
    this.icon = value;
    return this;
  }
  setColor(value) {
    this.color = value;
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

  // Helper methods
  isItem() {
    return this.type === 'item';
  }
  isCategory() {
    return this.type === 'category';
  }
  isPlace() {
    return this.type === 'place';
  }

  // Konwersja do formatu bazy danych (snake_case)
  toDatabase() {
    return {
      type: this.type,
      parent_id: this.parentId,
      category_id: this.categoryId,
      name: this.name,
      description: this.description,
      icon: this.icon,
      color: this.color,
      sort_order: this.sortOrder,
      is_archived: this.isArchived ? 1 : 0,
    };
  }
}
