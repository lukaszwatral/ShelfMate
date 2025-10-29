const EntityTypeEnum = Object.freeze({
  ITEM: 'item',
  CATEGORY: 'category',
  PLACE: 'place',
})

const EntityTypeEnumValues = Object.freeze(Object.values(EntityTypeEnum))

export { EntityTypeEnumValues }
export function isEntityType(value) {
  return EntityTypeEnumValues.includes(value)
}

export default EntityTypeEnum
