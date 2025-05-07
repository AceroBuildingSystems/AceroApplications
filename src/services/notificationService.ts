import { Notification, NotificationDocument } from "@/models/Notification.model";
import mongoose from "mongoose";

export interface CreateNotificationParams {
  recipient: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  type: 'APPROVAL_REQUEST' | 'APPROVAL_ACTION' | 'SYSTEM' | 'INFO';
  title: string;
  message: string;
  relatedEntity?: {
    type: 'REQUISITION' | 'USER' | 'DEPARTMENT' | 'OTHER';
    id: mongoose.Types.ObjectId;
  };
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
}

class NotificationService {
  async createNotification(params: CreateNotificationParams): Promise<NotificationDocument> {
    try {
      const notification = new Notification({
        ...params,
        priority: params.priority || 'MEDIUM'
      });
      return await notification.save();
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async getUserNotifications(userId: mongoose.Types.ObjectId, options: {
    limit?: number;
    skip?: number;
    status?: 'UNREAD' | 'READ' | 'ALL';
  } = {}): Promise<{ notifications: NotificationDocument[]; total: number }> {
    try {
      const { limit = 20, skip = 0, status = 'ALL' } = options;
      
      const query: any = {
        recipient: userId,
        isActive: true
      };

      if (status !== 'ALL') {
        query.status = status;
      }

      const [notifications, total] = await Promise.all([
        Notification.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('sender', 'firstName lastName displayName email')
          .lean(),
        Notification.countDocuments(query)
      ]);

      return { notifications, total };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: mongoose.Types.ObjectId): Promise<NotificationDocument> {
    try {
      return await Notification.findByIdAndUpdate(
        notificationId,
        {
          status: 'READ',
          readAt: new Date()
        },
        { new: true }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(userId: mongoose.Types.ObjectId): Promise<void> {
    try {
      await Notification.updateMany(
        {
          recipient: userId,
          status: 'UNREAD'
        },
        {
          status: 'READ',
          readAt: new Date()
        }
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: mongoose.Types.ObjectId): Promise<void> {
    try {
      await Notification.findByIdAndUpdate(
        notificationId,
        { isActive: false }
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  async getUnreadCount(userId: mongoose.Types.ObjectId): Promise<number> {
    try {
      return await Notification.countDocuments({
        recipient: userId,
        status: 'UNREAD',
        isActive: true
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService(); 