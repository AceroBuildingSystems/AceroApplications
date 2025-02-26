import { baseApi } from '../api';
import { INotification } from '@/models/Notification.model';

const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<INotification[], string>({
      query: (userId) => ({
        url: `/notifications?userId=${userId}`,
        method: 'GET',
      }),
      providesTags: ['Notification'],
    }),
    createNotification: builder.mutation<INotification, Partial<INotification>>({
      query: (notificationData) => ({
        url: '/notifications',
        method: 'POST',
        body: { action: 'create', ...notificationData },
      }),
      invalidatesTags: ['Notification'],
    }),
    updateNotification: builder.mutation<INotification, { id: string; read: boolean }>({
      query: ({ id, read }) => ({
        url: '/notifications',
        method: 'POST',
        body: { action: 'update', id, read },
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetNotificationsQuery, useCreateNotificationMutation, useUpdateNotificationMutation } = notificationApi;