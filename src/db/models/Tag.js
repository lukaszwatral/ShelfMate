export class Tag {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.color = data.color || null;
    this.icon = data.icon || null;
    this.createdAt = data.created_at || data.createdAt || null;
  }

  getId() {
    return this.id;
  }
  getName() {
    return this.name;
  }
  getColor() {
    return this.color;
  }
  getIcon() {
    return this.icon;
  }
  getCreatedAt() {
    return this.createdAt;
  }

  setName(value) {
    this.name = value;
    return this;
  }
  setColor(value) {
    this.color = value;
    return this;
  }
  setIcon(value) {
    this.icon = value;
    return this;
  }

  toDatabase() {
    return {
      name: this.name,
      color: this.color,
      icon: this.icon,
    };
  }
}
