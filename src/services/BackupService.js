import { backupRepository } from '@/db/repositories/BackupRepository';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Toast } from '@capacitor/toast';

export class BackupService {
  /**
   * Generuje JSON, zapisuje go na dysku I otwiera okno udostępniania.
   */
  async exportBackup() {
    try {
      const data = await backupRepository.getDatabaseDump();
      const jsonString = JSON.stringify(data, null, 2);
      const fileName = `shelfmate_backup_${this.getTimestamp()}.json`;

      const result = await Filesystem.writeFile({
        path: fileName,
        data: jsonString,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });

      if (Capacitor.getPlatform() === 'android') {
        try {
          await Filesystem.writeFile({
            path: `Download/${fileName}`,
            data: jsonString,
            directory: Directory.ExternalStorage,
            encoding: Encoding.UTF8,
          });
        } catch (err) {
          console.warn('Nie udało się zapisać kopii w Pobrane:', err);
        }
      }

      await Share.share({
        title: 'Kopia zapasowa ShelfMate',
        text: 'Oto Twój plik kopii zapasowej.',
        files: [result.uri],
      });

      return true;
    } catch (e) {
      console.error('Błąd eksportu:', e);
      if (e.message !== 'Share canceled') {
        throw e;
      }
    }
  }

  /**
   * Import (Bez zmian)
   */
  async importBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);

      if (!data.version || !data.data) {
        throw new Error('Nieprawidłowy format pliku backupu.');
      }

      await backupRepository.restoreDatabase(data);
      return true;
    } catch (e) {
      console.error('Błąd importu:', e);
      throw e;
    }
  }

  getTimestamp() {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace(/[:T]/g, '-');
  }
}

export const backupService = new BackupService();
