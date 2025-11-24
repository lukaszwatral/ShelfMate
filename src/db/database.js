import { Kysely, sql } from 'kysely';
import CapacitorSQLiteKyselyDialect from 'capacitor-sqlite-kysely';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';

const dbName = import.meta.env.VITE_DB_FILE_NAME;

export const db = new Kysely({
  dialect: new CapacitorSQLiteKyselyDialect(new SQLiteConnection(CapacitorSQLite), {
    name: dbName,
    encryption: false,
    mode: 'no-encryption',
    version: 1,
    readonly: false,
  }),
});
