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

-- Zunifikowana tabela dla wszystkich obiektów
CREATE TABLE IF NOT EXISTS Entity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('item', 'category', 'place')), -- Przedmiot, Kategoria, Miejsce

-- Relacja LOKALIZACJI (Gdzie jestem?)
-- (np. Przedmiot -> Miejsce, Przedmiot -> Przedmiot, Miejsce -> Miejsce)
parent_id INTEGER,

  -- Relacja KLASYFIKACJI (Czym jestem?)
-- (np. Przedmiot -> Kategoria, Kategoria -> Kategoria)
category_id INTEGER,

  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INTEGER,
  is_archived BOOLEAN NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  deleted_at DATETIME,
  FOREIGN KEY (parent_id) REFERENCES Entity(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES Entity(id) ON DELETE SET NULL
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

-- Definicje pól niestandardowych
CREATE TABLE IF NOT EXISTS CustomField (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Powiązanie z SZABLONEM KATEGORII (dla pól dziedziczonych)
category_template_id INTEGER,

  -- Powiązanie z KONKRETNĄ ENCJĄ (dla pól "własnych" danego przedmiotu)
entity_id INTEGER,

  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK(field_type IN ('text', 'number', 'date', 'boolean', 'select')),
is_required BOOLEAN NOT NULL DEFAULT 0,
  default_value TEXT,
  options TEXT, -- np. JSON z opcjami dla typu 'select'
sort_order INTEGER,

  -- Implementacja "Soft Delete"
is_archived BOOLEAN NOT NULL DEFAULT 0,
  deleted_at DATETIME,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,

  FOREIGN KEY (category_template_id) REFERENCES Entity(id) ON DELETE CASCADE,
  FOREIGN KEY (entity_id) REFERENCES Entity(id) ON DELETE CASCADE,
  -- Zapewnia, że pole jest albo częścią szablonu, albo polem własnym, ale nie oboma
CHECK (category_template_id IS NOT NULL OR entity_id IS NOT NULL)
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

  -- Zmieniono z ON DELETE CASCADE na RESTRICT, aby chronić dane
-- Wymusza to użycie "is_archived" w CustomField zamiast twardego usuwania.
  FOREIGN KEY (custom_field_id) REFERENCES CustomField(id) ON DELETE RESTRICT,

  UNIQUE(entity_id, custom_field_id)
);

-- NOWA TABELA: Wyjątki od pól szablonu
-- Przechowuje informację, że użytkownik "ukrył" pole z szablonu dla tej jednej encji.
  CREATE TABLE IF NOT EXISTS EntityFieldException (
  entity_id INTEGER NOT NULL,
  custom_field_id INTEGER NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (entity_id, custom_field_id),
  FOREIGN KEY (entity_id) REFERENCES Entity(id) ON DELETE CASCADE,
  FOREIGN KEY (custom_field_id) REFERENCES CustomField(id) ON DELETE CASCADE
);


-- ============================================
-- TABELE SYSTEMOWE
-- ============================================

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
-- TRIGGERS (WYZWALACZE)
-- ============================================

CREATE TRIGGER IF NOT EXISTS [UpdateEntityUpdatedAt]
AFTER UPDATE ON Entity FOR EACH ROW
BEGIN
UPDATE Entity SET updated_at = CURRENT_TIMESTAMP WHERE id = old.id;
END;

-- Zaktualizowany wyzwalacz dla CustomField
CREATE TRIGGER IF NOT EXISTS [UpdateCustomFieldUpdatedAt]
AFTER UPDATE ON CustomField FOR EACH ROW
BEGIN
-- Ustawia datę archiwizacji przy pierwszym oznaczeniu jako zarchiwizowany
UPDATE CustomField
SET
updated_at = CURRENT_TIMESTAMP,
  deleted_at = CASE
WHEN new.is_archived = 1 AND old.is_archived = 0 THEN CURRENT_TIMESTAMP
WHEN new.is_archived = 0 THEN NULL
ELSE old.deleted_at
END
WHERE id = old.id;
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

-- Wstawienie MIEJSC (używają 'parent_id' do lokalizacji)
INSERT INTO Entity (type, name, description, parent_id) VALUES
('place', 'Dom', 'Główne miejsce zamieszkania', NULL),
  ('place', 'Biuro', 'Miejsce pracy', NULL);

-- Przykład zagnieżdżonego miejsca (Garaż W Domu)
INSERT INTO Entity (type, name, description, parent_id) VALUES
('place', 'Garaż', 'Garaż przydomowy', (SELECT id FROM Entity WHERE name = 'Dom' AND type = 'place'));

-- Wstawienie KATEGORII (używają 'category_id' do klasyfikacji)
INSERT INTO Entity (type, name, description, icon, color, category_id) VALUES
('category', 'Elektronika', 'Urządzenia elektroniczne.', 'icon-electronics', '#4A90E2', NULL),
  ('category', 'Dokumenty', 'Ważne dokumenty.', 'icon-documents', '#F5A623', NULL),
  ('category', 'Narzędzia', 'Narzędzia ręczne i osprzęt.', 'icon-tools', '#7ED321', NULL),
  ('category', 'Książki', 'Książki i czasopisma.', 'icon-books', '#BD10E0', NULL);

-- Przykład zagnieżdżonej kategorii (AGD W Elektronice)
INSERT INTO Entity (type, name, description, icon, color, category_id) VALUES
('category', 'AGD', 'Sprzęt gospodarstwa domowego', 'icon-agd', '#4A90E2', (SELECT id FROM Entity WHERE name = 'Elektronika' AND type = 'category'));

-- Wstawienie domyślnych pól do szablonów
  INSERT INTO CustomField (category_template_id, field_name, field_type) VALUES
((SELECT id FROM Entity WHERE name = 'Elektronika'), 'Gwarancja', 'date'),
((SELECT id FROM Entity WHERE name = 'Elektronika'), 'Producent', 'text'),
((SELECT id FROM Entity WHERE name = 'AGD'), 'Klasa energetyczna', 'select'); -- 'options' mogłyby być np. '["A", "B", "C"]'

-- Wstawienie języków i ustawień
INSERT INTO Locale (code, name) VALUES ('pl', 'Polski'), ('en', 'English');
INSERT INTO Setting (key, value) VALUES ('locale', 'pl');

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
