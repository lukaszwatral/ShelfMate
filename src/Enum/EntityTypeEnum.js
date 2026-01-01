/**
 * Enum defining the primary entity types in the system.
 */
const EntityTypeEnum = Object.freeze({
  ITEM: 'item',
  CATEGORY: 'category',
  PLACE: 'place',
});

const EntityTypeEnumValues = Object.freeze(Object.values(EntityTypeEnum));

/**
 * Checks if a value is a valid EntityType.
 * @param {string} value - The value to validate.
 * @returns {boolean}
 */
export function isEntityType(value) {
  return EntityTypeEnumValues.includes(value);
}

export { EntityTypeEnumValues };
export default EntityTypeEnum;
