const AttributeTypeEnum = Object.freeze({
  TEXT: 'text',
  NUMBER: 'number',
  DATE: 'date',
  DATETIME: 'datetime',
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

const AttributeTypeDescriptions = Object.freeze({
  text: 'attributeTypeDescriptions.text',
  number: 'attributeTypeDescriptions.number',
  date: 'attributeTypeDescriptions.date',
  datetime: 'attributeTypeDescriptions.datetime',
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

export function getAttributeTypeDescription(type) {
  return AttributeTypeDescriptions[type] || '';
}

export { AttributeTypeEnumValues };
export function isEntityType(value) {
  return AttributeTypeEnumValues.includes(value);
}

export default AttributeTypeEnum;
export { AttributeTypeDescriptions };
