
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { JeepSqlite } from 'jeep-sqlite/dist/components/jeep-sqlite';

const DB_NAME = 'shelfmate_db';

class DatabaseService {
  constructor() {
    this.sqlite = null;
    this.db = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      const platform = Capacitor.getPlatform();
      this.sqlite = new SQLiteConnection(CapacitorSQLite);

      if (platform === 'web') {
        // Ensure the custom element is defined only once
        if (!customElements.get('jeep-sqlite')) {
          customElements.define('jeep-sqlite', JeepSqlite);
        }
        const jeepSqliteEl = document.createElement('jeep-sqlite');
        document.body.appendChild(jeepSqliteEl);
        await customElements.whenDefined('jeep-sqlite');
        await this.sqlite.initWebStore();
      }

      const ret = await this.sqlite.checkConnectionsConsistency();
      const isConn = (await this.sqlite.isConnection(DB_NAME, false)).result;

      if (ret.result && isConn) {
        this.db = await this.sqlite.retrieveConnection(DB_NAME, false);
      } else {
        this.db = await this.sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);
      }

      await this.db.open();
      await this.setupSchema();
      this.isInitialized = true;
      console.log('Database initialized successfully');
    } catch (err) {
      console.error('Error initializing database:', err);
      throw err;
    }
  }

  async setupSchema() {
    // Example schema setup
    const schema = `
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT
      );
    `;
    await this.db.execute(schema);
  }

  async execute(statement) {
    if (!this.isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db.execute(statement);
  }

  async query(statement, values = []) {
    if (!this.isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db.query(statement, values);
  }

  getDb() {
    return this.db;
  }
}

// Export a singleton instance
export const dbService = new DatabaseService();

