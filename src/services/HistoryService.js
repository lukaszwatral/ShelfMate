import { Preferences } from '@capacitor/preferences';

const STORAGE_KEY = 'recently_viewed_entities';
const MAX_ITEMS = 10;

export const HistoryService = {
  async getList() {
    const { value } = await Preferences.get({ key: STORAGE_KEY });
    return value ? JSON.parse(value) : [];
  },

  async addItem(entity) {
    let list = await this.getList();
    list = list.filter((item) => item.id !== entity.id);

    const typeIcons = {
      item: 'bag-fill',
      category: 'tag-fill',
      place: 'box-seam-fill',
    };
    const item = {
      id: entity.id,
      name: entity.name,
      icon: entity.icon || typeIcons[entity.type],
      type: entity.type,
    };

    list.unshift(item);

    if (list.length > MAX_ITEMS) {
      list = list.slice(0, MAX_ITEMS);
    }

    await Preferences.set({
      key: STORAGE_KEY,
      value: JSON.stringify(list),
    });
  },

  async clear() {
    await Preferences.remove({ key: STORAGE_KEY });
  },
};
