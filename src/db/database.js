import { Kysely } from 'kysely';
import CapacitorSQLiteKyselyDialect from 'capacitor-sqlite-kysely';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';

// Retrieve database name from environment variables
const dbName = import.meta.env.VITE_DB_FILE_NAME;

/**
 * Global Kysely database instance.
 * Configured to use CapacitorSQLite for native mobile database access.
 */
export const db = new Kysely({
  dialect: new CapacitorSQLiteKyselyDialect(new SQLiteConnection(CapacitorSQLite), {
    name: dbName,
    encryption: false,
    mode: 'no-encryption',
    version: 1,
    readonly: false,
  }),
});
