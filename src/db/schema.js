/**
 * Global Database Schema Definition.
 * Represents the structure of the database tables for Kysely type inference.
 *
 * @typedef {Object} Database
 * @property {EntityTable} Entity
 * @property {TagTable} Tag
 * @property {EntityTagTable} EntityTag
 * @property {FileTable} File
 * @property {CodeTable} Code
 * @property {CustomFieldTable} CustomField
 * @property {CustomFieldValueTable} CustomFieldValue
 * @property {EntityFieldExceptionTable} EntityFieldException
 * @property {SettingTable} Setting
 * @property {LocaleTable} Locale
 */

/**
 * @typedef {Object} EntityTable
 * @property {number} id
 * @property {'item'|'category'|'place'} type
 * @property {number|null} parentId
 * @property {number|null} categoryId
 * @property {string} name
 * @property {string|null} description
 * @property {string|null} icon
 * @property {string|null} color
 * @property {number|null} sortOrder
 * @property {boolean} isArchived
 * @property {string} createdAt
 * @property {string|null} updatedAt
 */

/**
 * @typedef {Object} TagTable
 * @property {number} id
 * @property {string} name
 * @property {string|null} color
 * @property {string|null} icon
 * @property {string} createdAt
 */

/**
 * @typedef {Object} EntityTagTable
 * @property {number} id
 * @property {number} entityId
 * @property {number} tagId
 * @property {string} createdAt
 */

/**
 * @typedef {Object} FileTable
 * @property {number} id
 * @property {number} entityId
 * @property {string} filePath
 * @property {string} fileName
 * @property {string|null} mimeType
 * @property {boolean} isPrimary
 * @property {string|null} thumbnailPath
 * @property {string} createdAt
 */

/**
 * @typedef {Object} CodeTable
 * @property {number} id
 * @property {number} entityId
 * @property {string|null} codeType
 * @property {string} codeValue
 * @property {string} createdAt
 */

/**
 * @typedef {Object} CustomFieldTable
 * @property {number} id
 * @property {number|null} categoryTemplateId
 * @property {number|null} entityId
 * @property {string} fieldName
 * @property {'text'|'number'|'date'|'datetime-local'|'expiry_date'|'textarea'|'checkbox'|'radio'|'select'|'file'|'image'|'color'|'url'|'boolean'|'email'} fieldType
 * @property {boolean} isRequired
 * @property {string|null} defaultValue
 * @property {string|null} options
 * @property {number|null} sortOrder
 * @property {boolean} isArchived
 * @property {string} createdAt
 * @property {string|null} updatedAt
 */

/**
 * @typedef {Object} CustomFieldValueTable
 * @property {number} id
 * @property {number} entityId
 * @property {number} customFieldId
 * @property {string|null} fieldValue
 * @property {string} createdAt
 * @property {string|null} updatedAt
 */

/**
 * @typedef {Object} EntityFieldExceptionTable
 * @property {number} entityId
 * @property {number} customFieldId
 * @property {string} createdAt
 */

/**
 * @typedef {Object} SettingTable
 * @property {string} key
 * @property {string|null} value
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} LocaleTable
 * @property {string} code
 * @property {string} name
 * @property {string} createdAt
 */
