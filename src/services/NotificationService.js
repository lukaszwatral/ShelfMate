import { LocalNotifications } from '@capacitor/local-notifications';
import { Toast } from '@capacitor/toast';

export const NotificationService = {
  async ensurePermissions() {
    let status = await LocalNotifications.checkPermissions();

    if (status.display === 'granted') {
      return true;
    }

    const request = await LocalNotifications.requestPermissions();

    if (request.display === 'granted') {
      return true;
    } else {
      return false;
    }
  },

  async scheduleNotification(id, title, body, date) {
    const hasPermission = await this.ensurePermissions();
    if (!hasPermission) return;

    if (date <= new Date()) return;

    const notificationId = Number(id);

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: title,
            body: body,
            id: notificationId,
            schedule: { at: date },
            sound: null,
            attachments: null,
            actionTypeId: '',
            extra: null,
          },
        ],
      });
      console.log(`Zaplanowano powiadomienie na: ${date.toLocaleString()}`);
    } catch (e) {
      console.error('Błąd planowania powiadomienia:', e);
    }
  },

  async cancelNotification(id) {
    try {
      await LocalNotifications.cancel({ notifications: [{ id: Number(id) }] });
    } catch (e) {}
  },
};
