import * as notificationServices from '@/server/services/notificationServices';
import { INotification } from '@/models/Notification.model';
import { SUCCESS, ERROR } from '@/shared/constants';

export const notificationManager = {
  async getNotifications(userId: string): Promise<{ status: string; message?: string; data?: INotification[] }> {
    try {
      const result = await notificationServices.getNotifications({ userId });
      return result;
    } catch (error: any) {
      console.error(error);
      return { status: ERROR, message: error.message };
    }
  },

  async createNotification(notificationData: Partial<INotification>): Promise<{ status: string; message?: string; data?: INotification }> {
    try {
      const result = await notificationServices.createNotification({ data: notificationData });
      return result;
    } catch (error: any) {
      console.error(error);
      return { status: ERROR, message: error.message };
    }
  },

  async updateNotification(id: string, updateData: Partial<INotification>): Promise<{ status: string; message?: string; data?: INotification }> {
    try {
      const result = await notificationServices.updateNotification({ id: id, data: updateData });
      return result;
    } catch (error: any) {
      console.error(error);
      return { status: ERROR, message: error.message };
    }
  },
};