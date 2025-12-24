import { db } from '@/db/database';
import { initializeDatabase } from '@/db/init';
import { sql } from 'kysely';

export class BackupRepository {
  async getDatabaseDump() {
    const [
      entities,
      tags,
      entityTags,
      files,
      codes,
      customFields,
      customFieldValues,
      settings,
      locales,
    ] = await Promise.all([
      db.selectFrom('Entity').selectAll().execute(),
      db.selectFrom('Tag').selectAll().execute(),
      db.selectFrom('EntityTag').selectAll().execute(),
      db.selectFrom('File').selectAll().execute(),
      db.selectFrom('Code').selectAll().execute(),
      db.selectFrom('CustomField').selectAll().execute(),
      db.selectFrom('CustomFieldValue').selectAll().execute(),
      db.selectFrom('Setting').selectAll().execute(),
      db.selectFrom('Locale').selectAll().execute(),
    ]);

    return {
      version: 1,
      timestamp: new Date().toISOString(),
      data: {
        Entity: entities,
        Tag: tags,
        EntityTag: entityTags,
        File: files,
        Code: codes,
        CustomField: customFields,
        CustomFieldValue: customFieldValues,
        Setting: settings,
        Locale: locales,
      },
    };
  }

  async restoreDatabase(backupData) {
    const { data } = backupData;

    await this.dropEntireSchema();

    await initializeDatabase();

    await db.transaction().execute(async (trx) => {
      await sql`PRAGMA foreign_keys = OFF`.execute(trx);

      const userTables = [
        'EntityTag',
        'CustomFieldValue',
        'EntityFieldException',
        'File',
        'Code',
        'CustomField',
        'Tag',
        'Entity',
      ];

      for (const table of userTables) {
        await trx.deleteFrom(table).execute();
      }

      // Czyścimy search i liczniki
      await sql`DELETE FROM EntitySearch`.execute(trx);
      await sql`DELETE FROM sqlite_sequence`.execute(trx);

      // Wgrywamy dane użytkownika
      if (data.Entity?.length) await trx.insertInto('Entity').values(data.Entity).execute();
      if (data.Tag?.length) await trx.insertInto('Tag').values(data.Tag).execute();
      if (data.EntityTag?.length)
        await trx.insertInto('EntityTag').values(data.EntityTag).execute();
      if (data.File?.length) await trx.insertInto('File').values(data.File).execute();
      if (data.Code?.length) await trx.insertInto('Code').values(data.Code).execute();
      if (data.CustomField?.length)
        await trx.insertInto('CustomField').values(data.CustomField).execute();
      if (data.CustomFieldValue?.length)
        await trx.insertInto('CustomFieldValue').values(data.CustomFieldValue).execute();

      if (data.Locale && data.Locale.length > 0) {
        await trx.deleteFrom('Locale').execute();
        await trx.insertInto('Locale').values(data.Locale).execute();
      }

      if (data.Setting && data.Setting.length > 0) {
        await trx.deleteFrom('Setting').execute();
        await trx.insertInto('Setting').values(data.Setting).execute();
      }

      await sql`PRAGMA foreign_keys = ON`.execute(trx);
    });
  }

  async performFactoryReset() {
    try {
      console.log('Rozpoczynam Factory Reset...');

      // 1. Usuń wszystko
      await this.dropEntireSchema();

      // 2. Zainicjuj na nowo
      console.log('Inicjalizacja bazy na nowo...');
      await initializeDatabase();

      console.log('Factory Reset zakończony sukcesem.');
    } catch (error) {
      console.error('Błąd resetowania bazy:', error);
      throw error;
    }
  }

  async dropEntireSchema() {
    await db.transaction().execute(async (trx) => {
      await sql`PRAGMA foreign_keys = OFF`.execute(trx);

      const tablesToDelete = [
        'EntityTag',
        'CustomFieldValue',
        'EntityFieldException',
        'File',
        'Code',
        'CustomField',
        'Tag',
        'Setting',
        'Locale',
        'Entity',
        'EntitySearch',
      ];

      for (const table of tablesToDelete) {
        await sql.raw(`DROP TABLE IF EXISTS "${table}"`).execute(trx);
      }

      await sql`DELETE FROM sqlite_sequence`.execute(trx);

      await sql`PRAGMA foreign_keys = ON`.execute(trx);
    });
  }
}

export const backupRepository = new BackupRepository();
