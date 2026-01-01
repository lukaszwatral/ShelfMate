import { backupRepository } from '@/db/repositories/BackupRepository';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

export class BackupService {
  /**
   * Generates JSON, saves it to disk, and opens the share dialog.
   * On Android, it attempts to save a copy to Downloads.
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
          console.warn('Failed to save copy to Downloads:', err);
        }
      }

      await Share.share({
        title: 'ShelfMate Backup',
        text: 'Here is your backup file.',
        files: [result.uri],
      });

      return true;
    } catch (e) {
      console.error('Export failed:', e);
      if (e.message !== 'Share canceled') {
        throw e;
      }
    }
  }

  /**
   * Parses the backup file and restores the database.
   * @param {string} jsonString - The raw JSON string from the backup file.
   */
  async importBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);

      if (!data.version || !data.data) {
        throw new Error('Invalid backup file format.');
      }

      await backupRepository.restoreDatabase(data);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      throw e;
    }
  }

  getTimestamp() {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace(/[:T]/g, '-');
  }
}

export const backupService = new BackupService();
