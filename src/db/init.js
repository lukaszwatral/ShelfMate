import { db } from './database.js';
import { sql } from 'kysely';

/**
 * Initializes the database structure.
 * Creates tables, indices, triggers, and seeds default system data (locales, settings).
 * @returns {Promise<boolean>} True if initialization succeeds.
 */
export async function initializeDatabase() {
  try {
    await sql`PRAGMA foreign_keys = ON`.execute(db);

    // ==========================================
    // 1. TABLE DEFINITIONS
    // ==========================================

    await sql`
      CREATE TABLE IF NOT EXISTS Entity (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('item', 'category', 'place')),
        parent_id INTEGER,
        category_id INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        color TEXT,
        sort_order INTEGER,
        is_archived BOOLEAN NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME,
        FOREIGN KEY (parent_id) REFERENCES Entity(id) ON DELETE SET NULL,
        FOREIGN KEY (category_id) REFERENCES Entity(id) ON DELETE SET NULL
        )
    `.execute(db);

    await sql`
      CREATE TABLE IF NOT EXISTS Tag (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        color TEXT,
        icon TEXT,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `.execute(db);

    await sql`
      CREATE TABLE IF NOT EXISTS EntityTag (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (entity_id) REFERENCES Entity(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES Tag(id) ON DELETE CASCADE,
        UNIQUE(entity_id, tag_id)
        )
    `.execute(db);

    await sql`
      CREATE TABLE IF NOT EXISTS File (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_id INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        file_name TEXT NOT NULL,
        mime_type TEXT,
        is_primary BOOLEAN NOT NULL DEFAULT 0,
        thumbnail_path TEXT,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (entity_id) REFERENCES Entity(id) ON DELETE CASCADE
        )
    `.execute(db);

    await sql`
      CREATE TABLE IF NOT EXISTS Code (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_id INTEGER NOT NULL,
        code_type TEXT NOT NULL,
        code_value TEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (entity_id) REFERENCES Entity(id) ON DELETE CASCADE,
        UNIQUE(code_value, code_type)
        )
    `.execute(db);

    await sql`
      CREATE TABLE IF NOT EXISTS CustomField (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_template_id INTEGER,
        entity_id INTEGER,
        field_name TEXT NOT NULL,
        field_type TEXT NOT NULL CHECK(
        field_type IN (
        'text', 'number', 'date', 'datetime-local', 'expiry_date',
        'textarea', 'checkbox', 'radio', 'select', 'file',
        'image', 'color', 'url', 'boolean', 'email'
      )
        ),
        is_required BOOLEAN NOT NULL DEFAULT 0,
        default_value TEXT,
        options TEXT,
        sort_order INTEGER,
        is_archived BOOLEAN NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME,
        FOREIGN KEY (category_template_id) REFERENCES Entity(id) ON DELETE CASCADE,
        FOREIGN KEY (entity_id) REFERENCES Entity(id) ON DELETE CASCADE,
        CHECK (category_template_id IS NOT NULL OR entity_id IS NOT NULL)
        )
    `.execute(db);

    await sql`
      CREATE TABLE IF NOT EXISTS CustomFieldValue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_id INTEGER NOT NULL,
        custom_field_id INTEGER NOT NULL,
        field_value TEXT,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME,
        FOREIGN KEY (entity_id) REFERENCES Entity(id) ON DELETE CASCADE,
        FOREIGN KEY (custom_field_id) REFERENCES CustomField(id) ON DELETE RESTRICT,
        UNIQUE(entity_id, custom_field_id)
        )
    `.execute(db);

    await sql`
      CREATE TABLE IF NOT EXISTS EntityFieldException (
        entity_id INTEGER NOT NULL,
        custom_field_id INTEGER NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (entity_id, custom_field_id),
        FOREIGN KEY (entity_id) REFERENCES Entity(id) ON DELETE CASCADE,
        FOREIGN KEY (custom_field_id) REFERENCES CustomField(id) ON DELETE CASCADE
        )
    `.execute(db);

    await sql`
      CREATE TABLE IF NOT EXISTS Setting (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `.execute(db);

    await sql`
      CREATE TABLE IF NOT EXISTS Locale (
        code TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `.execute(db);

    // --- Full Text Search (FTS) Table ---
    await sql`
      CREATE VIRTUAL TABLE IF NOT EXISTS EntitySearch USING fts5(
        entity_id UNINDEXED,
        name,
        description,
        custom_values
      )
    `.execute(db);

    // ==========================================
    // 2. INDICES
    // ==========================================
    await sql`CREATE INDEX IF NOT EXISTS idx_entity_parent ON Entity(parent_id)`.execute(db);
    await sql`CREATE INDEX IF NOT EXISTS idx_entity_category ON Entity(category_id)`.execute(db);
    await sql`CREATE INDEX IF NOT EXISTS idx_entity_list_view ON Entity(type, is_archived, name)`.execute(
      db,
    );
    await sql`CREATE INDEX IF NOT EXISTS idx_entity_recent ON Entity(created_at DESC)`.execute(db);
    await sql`CREATE INDEX IF NOT EXISTS idx_entity_name ON Entity(name)`.execute(db);

    await sql`CREATE INDEX IF NOT EXISTS idx_entity_tag_entity ON EntityTag(entity_id)`.execute(db);
    await sql`CREATE INDEX IF NOT EXISTS idx_entity_tag_tag ON EntityTag(tag_id)`.execute(db);

    await sql`CREATE INDEX IF NOT EXISTS idx_file_entity ON File(entity_id)`.execute(db);
    await sql`CREATE INDEX IF NOT EXISTS idx_code_entity ON Code(entity_id)`.execute(db);
    await sql`CREATE INDEX IF NOT EXISTS idx_code_value ON Code(code_value)`.execute(db);

    await sql`CREATE INDEX IF NOT EXISTS idx_cf_template ON CustomField(category_template_id)`.execute(
      db,
    );
    await sql`CREATE INDEX IF NOT EXISTS idx_cf_entity ON CustomField(entity_id)`.execute(db);

    await sql`CREATE INDEX IF NOT EXISTS idx_cfv_entity ON CustomFieldValue(entity_id)`.execute(db);
    await sql`CREATE INDEX IF NOT EXISTS idx_cfv_lookup ON CustomFieldValue(custom_field_id, field_value)`.execute(
      db,
    );

    // ==========================================
    // 3. SYSTEM TRIGGERS (Auto-update timestamps)
    // ==========================================
    await sql
      .raw(
        `
      CREATE TRIGGER IF NOT EXISTS UpdateEntityUpdatedAt
      AFTER UPDATE ON Entity FOR EACH ROW
      BEGIN
        UPDATE Entity SET updated_at = CURRENT_TIMESTAMP WHERE id = old.id;
      END
    `,
      )
      .execute(db);

    await sql
      .raw(
        `
      CREATE TRIGGER IF NOT EXISTS UpdateCustomFieldUpdatedAt
      AFTER UPDATE ON CustomField FOR EACH ROW
      BEGIN
        UPDATE CustomField SET updated_at = CURRENT_TIMESTAMP WHERE id = old.id;
      END
    `,
      )
      .execute(db);

    await sql
      .raw(
        `
      CREATE TRIGGER IF NOT EXISTS UpdateCustomFieldValueUpdatedAt
      AFTER UPDATE ON CustomFieldValue FOR EACH ROW
      BEGIN
        UPDATE CustomFieldValue SET updated_at = CURRENT_TIMESTAMP WHERE id = old.id;
      END
    `,
      )
      .execute(db);

    await sql
      .raw(
        `
      CREATE TRIGGER IF NOT EXISTS UpdateSettingUpdatedAt
      AFTER UPDATE ON Setting FOR EACH ROW
      BEGIN
        UPDATE Setting SET updated_at = CURRENT_TIMESTAMP WHERE key = old.key;
      END
    `,
      )
      .execute(db);

    // ==========================================
    // 4. SEARCH TRIGGERS (Sync with FTS)
    // ==========================================

    // Sync Entity inserts
    await sql
      .raw(
        `
      CREATE TRIGGER IF NOT EXISTS EntitySearchInsert
      AFTER INSERT ON Entity BEGIN
        INSERT INTO EntitySearch(entity_id, name, description, custom_values)
        VALUES (new.id, new.name, new.description, '');
      END;
    `,
      )
      .execute(db);

    // Sync Entity updates
    await sql
      .raw(
        `
      CREATE TRIGGER IF NOT EXISTS EntitySearchUpdate
      AFTER UPDATE ON Entity BEGIN
        UPDATE EntitySearch SET name = new.name, description = new.description
        WHERE entity_id = old.id;
      END;
    `,
      )
      .execute(db);

    // Sync Entity deletes
    await sql
      .raw(
        `
      CREATE TRIGGER IF NOT EXISTS EntitySearchDelete
      AFTER DELETE ON Entity BEGIN
        DELETE FROM EntitySearch WHERE entity_id = old.id;
      END;
    `,
      )
      .execute(db);

    // Sync CustomFieldValue inserts
    await sql
      .raw(
        `
      CREATE TRIGGER IF NOT EXISTS CFV_Search_Insert
      AFTER INSERT ON CustomFieldValue BEGIN
        UPDATE EntitySearch
        SET custom_values = (
          SELECT GROUP_CONCAT(field_value, ' ')
          FROM CustomFieldValue
          WHERE entity_id = new.entity_id
        )
        WHERE entity_id = new.entity_id;
      END;
    `,
      )
      .execute(db);

    // Sync CustomFieldValue updates
    await sql
      .raw(
        `
      CREATE TRIGGER IF NOT EXISTS CFV_Search_Update
      AFTER UPDATE ON CustomFieldValue BEGIN
        UPDATE EntitySearch
        SET custom_values = (
          SELECT GROUP_CONCAT(field_value, ' ')
          FROM CustomFieldValue
          WHERE entity_id = new.entity_id
        )
        WHERE entity_id = new.entity_id;
      END;
    `,
      )
      .execute(db);

    // Sync CustomFieldValue deletes
    await sql
      .raw(
        `
      CREATE TRIGGER IF NOT EXISTS CFV_Search_Delete
      AFTER DELETE ON CustomFieldValue BEGIN
        UPDATE EntitySearch
        SET custom_values = (
          SELECT GROUP_CONCAT(field_value, ' ')
          FROM CustomFieldValue
          WHERE entity_id = old.entity_id
        )
        WHERE entity_id = old.entity_id;
      END;
    `,
      )
      .execute(db);

    // ==========================================
    // 5. SEEDING (System configuration and locales)
    // ==========================================

    await db
      .insertInto('Locale')
      .values([
        { code: 'en', name: 'English' },
        { code: 'pl', name: 'Polski' },
        { code: 'de', name: 'Deutsch' },
        { code: 'fr', name: 'Français' },
        { code: 'es', name: 'Español' },
      ])
      .onConflict((oc) => oc.column('code').doNothing())
      .execute();

    await db
      .insertInto('Setting')
      .values({ key: 'locale', value: 'en' })
      .onConflict((oc) => oc.column('key').doNothing())
      .execute();

    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}
