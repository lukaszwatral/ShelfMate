import { Capacitor } from '@capacitor/core'
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite'

const DB_NAME = 'shelfmate.db'

const sqlite = new SQLiteConnection(CapacitorSQLite)
let db

const dbCreationQuery = `
-- Włączenie obsługi kluczy obcych w SQLite
PRAGMA foreign_keys = ON;

-- ============================================
-- TABELE GŁÓWNE I PODSTAWOWE
-- ============================================

-- Zunifikowana tabela dla wszystkich obiektów (przedmiotów, kategorii, miejsc itp.)
CREATE TABLE IF NOT EXISTS Entity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    parent_id INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    sort_order INTEGER,
    is_archived BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    deleted_at DATETIME,
    FOREIGN KEY (parent_id) REFERENCES Entity(id) ON DELETE SET NULL
);

-- Tabela definicji tagów
CREATE TABLE IF NOT EXISTS Tag (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT,
    icon TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELE ŁĄCZĄCE I POMOCNICZE
-- ============================================

-- Tabela asocjacyjna łącząca encje z tagami (wiele-do-wielu)
CREATE TABLE IF NOT EXISTS EntityTag (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (entity_id) REFERENCES Entity(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES Tag(id) ON DELETE CASCADE,
    UNIQUE(entity_id, tag_id)
);

-- Tabela dla plików powiązanych z encjami
CREATE TABLE IF NOT EXISTS File (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    mime_type TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT 0,
    is_icon BOOLEAN NOT NULL DEFAULT 0,
    thumbnail_path TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (entity_id) REFERENCES Entity(id) ON DELETE CASCADE
);

-- Tabela dla kodów (kreskowych, QR itp.) powiązanych z encjami
CREATE TABLE IF NOT EXISTS Code (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_id INTEGER NOT NULL,
    code_type TEXT NOT NULL,
    code_value TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (entity_id) REFERENCES Entity(id) ON DELETE CASCADE,
    UNIQUE(code_value, code_type)
);


-- ============================================
-- WZORZEC EAV (POLA NIESTANDARDOWE)
-- ============================================

-- Definicje pól niestandardowych, powiązane z typem encji
CREATE TABLE IF NOT EXISTS CustomField (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,
    field_name TEXT NOT NULL,
    field_type TEXT NOT NULL CHECK(field_type IN ('text', 'number', 'date', 'boolean', 'select')),
    is_required BOOLEAN NOT NULL DEFAULT 0,
    default_value TEXT,
    options TEXT, -- np. JSON z opcjami dla typu 'select'
    sort_order INTEGER,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
);

-- Wartości pól niestandardowych dla konkretnych encji
CREATE TABLE IF NOT EXISTS CustomFieldValue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_id INTEGER NOT NULL,
    custom_field_id INTEGER NOT NULL,
    field_value TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (entity_id) REFERENCES Entity(id) ON DELETE CASCADE,
    FOREIGN KEY (custom_field_id) REFERENCES CustomField(id) ON DELETE CASCADE,
    UNIQUE(entity_id, custom_field_id)
);


-- ============================================
-- TABELE SYSTEMOWE
-- ============================================

-- Tabela ustawień aplikacji (magazyn klucz-wartość)
CREATE TABLE IF NOT EXISTS Setting (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Locale (
code TEXT PRIMARY KEY NOT NULL,
name TEXT NOT NULL,
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- TRIGGERS (WYZWALACZE) DO AUTOMATYCZNEJ AKTUALIZACJI DAT
-- ============================================

CREATE TRIGGER IF NOT EXISTS [UpdateEntityUpdatedAt]
AFTER UPDATE ON Entity FOR EACH ROW
BEGIN
    UPDATE Entity SET updated_at = CURRENT_TIMESTAMP WHERE id = old.id;
END;

CREATE TRIGGER IF NOT EXISTS [UpdateCustomFieldUpdatedAt]
AFTER UPDATE ON CustomField FOR EACH ROW
BEGIN
    UPDATE CustomField SET updated_at = CURRENT_TIMESTAMP WHERE id = old.id;
END;

CREATE TRIGGER IF NOT EXISTS [UpdateCustomFieldValueUpdatedAt]
AFTER UPDATE ON CustomFieldValue FOR EACH ROW
BEGIN
    UPDATE CustomFieldValue SET updated_at = CURRENT_TIMESTAMP WHERE id = old.id;
END;

CREATE TRIGGER IF NOT EXISTS [UpdateSettingUpdatedAt]
AFTER UPDATE ON Setting FOR EACH ROW
BEGIN
    UPDATE Setting SET updated_at = CURRENT_TIMESTAMP WHERE key = old.key;
END;


-- ============================================
-- WSTĘPNE DANE STARTOWE
-- ============================================

-- Wstawienie dawnych Kategorii do tabeli Entity z typem 'category'
INSERT INTO Entity (type, name, description, icon, color) VALUES
('category', 'Elektronika', 'Urządzenia elektroniczne, gadżety i akcesoria.', 'icon-electronics', '#4A90E2'),
('category', 'Dokumenty', 'Ważne dokumenty, umowy, certyfikaty.', 'icon-documents', '#F5A623'),
('category', 'Narzędzia', 'Narzędzia ręczne, elektronarzędzia i osprzęt.', 'icon-tools', '#7ED321'),
('category', 'Książki', 'Książki, czasopisma i inne materiały do czytania.', 'icon-books', '#BD10E0');

-- Wstawienie dawnych Miejsc do tabeli Entity z typem 'place'
INSERT INTO Entity (type, name, description, parent_id) VALUES
('place', 'Dom', 'Główne miejsce zamieszkania', NULL),
('place', 'Biuro', 'Miejsce pracy', NULL);

-- Przykład wstawienia zagnieżdżonego miejsca (dziecka encji 'Dom')
INSERT INTO Entity (type, name, description, parent_id) VALUES
('place', 'Garaż', 'Garaż przydomowy', (SELECT id FROM Entity WHERE name = 'Dom' AND type = 'place'));
INSERT INTO Locale (code, name) VALUES
('pl', 'Polski'),
('en', 'English');

INSERT INTO Setting (key, value) VALUES
('locale', 'pl');

`

const initializeDatabase = async (forceCreate = false) => {
  console.log(DB_NAME)
  console.log('polaczenie', (await sqlite.isConnection(DB_NAME)).result)

  // Jeśli połączenie już istnieje i nie wymuszamy ponownego utworzenia, zwróć istniejące
  if (db && !forceCreate) {
    try {
      if ((await sqlite.isConnection(DB_NAME)).result) {
        return db
      }
    } catch (e) {}
  }

  try {
    // Zawsze próbuj zamknąć połączenie przed utworzeniem nowego
    try {
      await sqlite.closeConnection(DB_NAME)
      db = null
      console.log(`Zamknięto połączenie z bazą: ${DB_NAME}`)
    } catch (e) {
      // Jeśli nie uda się zamknąć, loguj i kontynuuj
      console.warn(`Nie udało się zamknąć połączenia: ${DB_NAME}`, e)
    }

    if (forceCreate) {
      if ((await sqlite.isDatabase(DB_NAME)).result) {
        console.log(`forceCreate=true. Usuwanie istniejącej bazy danych: ${DB_NAME}`)
        await sqlite.deleteDatabase(DB_NAME)
      }
      db = null
    }

    let dbExists = (await sqlite.isDatabase(DB_NAME)).result

    // Establish the connection
    try {
      db = await sqlite.retrieveConnection(DB_NAME)
      console.log(`Pobrano istniejące połączenie: ${DB_NAME}`)
    } catch (e) {
      console.log(`Tworzenie nowego połączenia: ${DB_NAME}`)
      db = await sqlite.createConnection(DB_NAME, false, 'no-encryption', 1)
    }

    await db.open()

    if (!dbExists) {
      console.log(`Tworzenie schematu i danych startowych dla bazy: ${DB_NAME}`)
      await db.execute(dbCreationQuery)
      console.log('Baza danych utworzona i wypełniona danymi startowymi.')
    } else {
      console.log('Baza danych już istnieje. Pomijanie tworzenia.')
    }

    return db
  } catch (err) {
    console.error('Błąd podczas inicjalizacji bazy danych:', err)
    throw err
  }
}

const getDb = () => {
  if (!db) {
    throw new Error(
      'Baza danych nie została zainicjalizowana. Wywołaj najpierw initializeDatabase().',
    )
  }
  return db
}

const closeDbConnection = async () => {
  try {
    if ((await sqlite.isConnection(DB_NAME)).result) {
      await sqlite.closeConnection(DB_NAME)
      db = null
      console.log(`Połączenie z bazą ${DB_NAME} zostało zamknięte.`)
    }
  } catch (err) {
    console.error('Błąd podczas zamykania połączenia z bazą:', err)
  }
}

export { initializeDatabase, getDb, closeDbConnection }
