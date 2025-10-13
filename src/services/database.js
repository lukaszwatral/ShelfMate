import { Capacitor } from '@capacitor/core'
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite'

const DB_NAME = 'shelfmate.db'

const sqlite = new SQLiteConnection(CapacitorSQLite)
let db

const dbCreationQuery = `
PRAGMA foreign_keys = ON;

-- Tabele główne i ich tłumaczenia
CREATE TABLE IF NOT EXISTS Categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT
);

CREATE TABLE IF NOT EXISTS CategoryTranslations (
    category_id INTEGER NOT NULL,
    lang_code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    PRIMARY KEY (category_id, lang_code),
    FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS CustomFields (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS CustomFieldTranslations (
    field_id INTEGER NOT NULL,
    lang_code TEXT NOT NULL,
    name TEXT NOT NULL,
    PRIMARY KEY (field_id, lang_code),
    FOREIGN KEY (field_id) REFERENCES CustomFields(id) ON DELETE CASCADE
);

-- Pozostałe tabele
CREATE TABLE IF NOT EXISTS Places (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    parent_id INTEGER,
    FOREIGN KEY (parent_id) REFERENCES Places(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    value REAL,
    barcode TEXT,
    nfc_tag TEXT,
    category_id INTEGER,
    place_id INTEGER,
    FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE SET NULL,
    FOREIGN KEY (place_id) REFERENCES Places(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS CategoryFields (
    category_id INTEGER NOT NULL,
    field_id INTEGER NOT NULL,
    PRIMARY KEY (category_id, field_id),
    FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE CASCADE,
    FOREIGN KEY (field_id) REFERENCES CustomFields(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ItemCustomFieldValues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    field_id INTEGER NOT NULL,
    value TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES Items(id) ON DELETE CASCADE,
    FOREIGN KEY (field_id) REFERENCES CustomFields(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    path TEXT NOT NULL,
    type TEXT,
    FOREIGN KEY (item_id) REFERENCES Items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ItemTags (
    item_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (item_id, tag_id),
    FOREIGN KEY (item_id) REFERENCES Items(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES Tags(id) ON DELETE CASCADE
);

-- Domyślne dane startowe (wersja wielojęzyczna)
INSERT OR IGNORE INTO Categories (id) VALUES (1), (2), (3), (4), (5), (6), (7);

INSERT OR IGNORE INTO CategoryTranslations (category_id, lang_code, name, description) VALUES
    (1, 'pl', 'Elektronika', 'Sprzęt RTV, AGD, komputery i akcesoria'),
    (2, 'pl', 'Dokumenty', 'Ważne dokumenty, umowy, faktury, gwarancje'),
    (3, 'pl', 'Książki', 'Kolekcja książek, komiksów i czasopism'),
    (4, 'pl', 'Ubrania', 'Odzież, obuwie i akcesoria'),
    (5, 'pl', 'Narzędzia', 'Narzędzia ręczne, elektronarzędzia i sprzęt warsztatowy'),
    (6, 'pl', 'Pamiątki', 'Przedmioty o wartości sentymentalnej, pamiątki z podróży'),
    (7, 'pl', 'Ogólne', 'Przedmioty, które nie pasują do innych kategorii');

INSERT OR IGNORE INTO CategoryTranslations (category_id, lang_code, name, description) VALUES
    (1, 'en', 'Electronics', 'Home electronics, appliances, computers and accessories'),
    (2, 'en', 'Documents', 'Important documents, contracts, invoices, warranties'),
    (3, 'en', 'Books', 'Collection of books, comics and magazines'),
    (4, 'en', 'Clothes', 'Clothing, footwear and accessories'),
    (5, 'en', 'Tools', 'Hand tools, power tools and workshop equipment'),
    (6, 'en', 'Souvenirs', 'Items with sentimental value, travel souvenirs'),
    (7, 'en', 'General', 'Items that do not fit into other categories');

INSERT OR IGNORE INTO CustomFields (id, type) VALUES
    (1, 'text'), (2, 'text'), (3, 'text'), (4, 'date'), (5, 'date'),
    (6, 'text'), (7, 'text'), (8, 'number'), (9, 'text'), (10, 'text');

INSERT OR IGNORE INTO CustomFieldTranslations (field_id, lang_code, name) VALUES
    (1, 'pl', 'Producent'), (2, 'pl', 'Model'), (3, 'pl', 'Numer seryjny'),
    (4, 'pl', 'Data zakupu'), (5, 'pl', 'Koniec gwarancji'), (6, 'pl', 'Autor'),
    (7, 'pl', 'ISBN'), (8, 'pl', 'Rok wydania'), (9, 'pl', 'Rozmiar'), (10, 'pl', 'Kolor');

INSERT OR IGNORE INTO CustomFieldTranslations (field_id, lang_code, name) VALUES
    (1, 'en', 'Manufacturer'), (2, 'en', 'Model'), (3, 'en', 'Serial number'),
    (4, 'en', 'Purchase date'), (5, 'en', 'Warranty ends'), (6, 'en', 'Author'),
    (7, 'en', 'ISBN'), (8, 'en', 'Publication year'), (9, 'en', 'Size'), (10, 'en', 'Color');

INSERT OR IGNORE INTO CategoryFields (category_id, field_id) VALUES
    (1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
    (3, 6), (3, 7), (3, 8);
`

const initializeDatabase = async () => {
  try {
    const isDb = (await sqlite.isDatabase(DB_NAME)).result
    db = await sqlite.createConnection(DB_NAME, false, 'no-encryption', 1)
    await db.open()

    if (!isDb) {
      console.log(`Baza danych ${DB_NAME} nie znaleziona. Tworzenie nowej...`)
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

export { initializeDatabase, getDb }
