import { LocalNotifications } from '@capacitor/local-notifications';

export const NotificationService = {
  /**
   * Checks and requests notification permissions from the OS.
   * @returns {Promise<boolean>} True if permissions are granted.
   */
  async ensurePermissions() {
    let status = await LocalNotifications.checkPermissions();

    if (status.display === 'granted') {
      return true;
    }

    const request = await LocalNotifications.requestPermissions();
    return request.display === 'granted';
  },

  /**
   * Schedules a local notification for a specific future date.
   * Checks for permissions and validates the date before scheduling.
   * @param {number|string} id - Unique identifier for the notification.
   * @param {string} title - Notification title.
   * @param {string} body - Notification body text.
   * @param {Date} date - The date and time to trigger the notification.
   */
  async scheduleNotification(id, title, body, date) {
    const hasPermission = await this.ensurePermissions();
    if (!hasPermission) return;

    if (date <= new Date()) return;

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Number(id),
            title,
            body,
            schedule: { at: date },
          },
        ],
      });
    } catch (e) {
      console.error('Failed to schedule notification:', e);
    }
  },

  /**
   * Cancels a specific notification by its ID.
   * @param {number|string} id - The identifier of the notification to cancel.
   */
  async cancelNotification(id) {
    try {
      await LocalNotifications.cancel({ notifications: [{ id: Number(id) }] });
    } catch (e) {
      // Ignore errors if notification doesn't exist
    }
  },
};
