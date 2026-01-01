/**
 * Enum defining all supported attribute types within the application.
 */
const AttributeTypeEnum = Object.freeze({
  TEXT: 'text',
  NUMBER: 'number',
  DATE: 'date',
  DATETIME: 'datetime-local',
  EXPIRY_DATE: 'expiry_date',
  TEXTAREA: 'textarea',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  SELECT: 'select',
  FILE: 'file',
  IMAGE: 'image',
  COLOR: 'color',
  URL: 'url',
  BOOLEAN: 'boolean',
  EMAIL: 'email',
});

/**
 * Mapping between AttributeTypeEnum values and their corresponding translation keys.
 * Note: Keys in this object must match the values of AttributeTypeEnum.
 */
const AttributeTypeDescriptions = Object.freeze({
  text: 'attributeTypeDescriptions.text',
  number: 'attributeTypeDescriptions.number',
  date: 'attributeTypeDescriptions.date',
  'datetime-local': 'attributeTypeDescriptions.datetime',
  expiry_date: 'attributeTypeDescriptions.expiryDate',
  textarea: 'attributeTypeDescriptions.textarea',
  checkbox: 'attributeTypeDescriptions.checkbox',
  radio: 'attributeTypeDescriptions.radio',
  select: 'attributeTypeDescriptions.select',
  file: 'attributeTypeDescriptions.file',
  image: 'attributeTypeDescriptions.image',
  color: 'attributeTypeDescriptions.color',
  url: 'attributeTypeDescriptions.url',
  boolean: 'attributeTypeDescriptions.boolean',
  email: 'attributeTypeDescriptions.email',
});

const AttributeTypeEnumValues = Object.values(AttributeTypeEnum);

/**
 * Retrieves the translation key for a given attribute type.
 * @param {string} type - The attribute type value.
 * @returns {string} The translation key or an empty string if not found.
 */
export function getAttributeTypeDescription(type) {
  return AttributeTypeDescriptions[type] || '';
}

/**
 * Checks if a given value is a valid attribute type.
 * @param {string} value - The value to check.
 * @returns {boolean} True if the value exists in AttributeTypeEnum.
 */
export function isEntityType(value) {
  return AttributeTypeEnumValues.includes(value);
}

export { AttributeTypeEnumValues, AttributeTypeDescriptions };
export default AttributeTypeEnum;
