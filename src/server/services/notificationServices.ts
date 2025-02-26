import { crudManager } from '@/server/managers/crudManager';
import { INotification } from '@/models/Notification.model';
import { MONGO_MODELS, SUCCESS, ERROR } from '@/shared/constants';

interface GetNotificationsOptions {
  filter?: object;
  userId: string;
}

interface CreateNotificationOptions {
  data: Partial<INotification>;
}

interface UpdateNotificationOptions {
  id: string;
  data: Partial<INotification>;
}

export const getNotifications = async (options: GetNotificationsOptions): Promise<{ status: string; message?: string; data?: INotification[] }> => {
  try {
    const result = await crudManager.mongooose.find(MONGO_MODELS.NOTIFICATION_MASTER, { filter: { userId: options.userId } });
    return result;
  } catch (error: any) {
    console.error(error);
    return { status: ERROR, message: error.message };
  }
};

export const createNotification = async (options: CreateNotificationOptions): Promise<{ status: string; message?: string; data?: INotification }> => {
  try {
    const result = await crudManager.mongooose.create(MONGO_MODELS.NOTIFICATION_MASTER, options);
    return result;
  } catch (error: any) {
    console.error(error);
    return { status: ERROR, message: error.message };
  }
};

export const updateNotification = async (options: UpdateNotificationOptions): Promise<{ status: string; message?: string; data?: INotification }> => {
  try {
    const result = await crudManager.mongooose.update(MONGO_MODELS.NOTIFICATION_MASTER, { filter: { _id: options.id }, data: options.data });
    return result;
  } catch (error: any) {
    console.error(error);
    return { status: ERROR, message: error.message };
  }
};