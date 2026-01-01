import { Preferences } from '@capacitor/preferences';

const STORAGE_KEY = 'recently_viewed_entities';
const MAX_ITEMS = 10;

const TYPE_ICONS = {
  item: 'bag-fill',
  category: 'tag-fill',
  place: 'box-seam-fill',
};

export const HistoryService = {
  /**
   * Retrieves the list of recently viewed entities from device storage.
   * @returns {Promise<Array>} List of history items.
   */
  async getList() {
    const { value } = await Preferences.get({ key: STORAGE_KEY });
    return value ? JSON.parse(value) : [];
  },

  /**
   * Adds an entity to the top of the history list.
   * Removes duplicates (if the item was already in the list, it moves to the top)
   * and ensures the list does not exceed MAX_ITEMS.
   * * @param {Object} entity - The entity object to add.
   */
  async addItem(entity) {
    let list = await this.getList();

    list = list.filter((item) => item.id !== entity.id);

    const item = {
      id: entity.id,
      name: entity.name,
      icon: entity.icon || TYPE_ICONS[entity.type],
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

  /**
   * Clears the entire history list.
   */
  async clear() {
    await Preferences.remove({ key: STORAGE_KEY });
  },
};
