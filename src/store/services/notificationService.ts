import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Notification'],
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: ({ limit = 20, skip = 0, status = 'ALL' }) => ({
        url: '/notifications',
        method: 'GET',
        params: { limit, skip, status },
      }),
      providesTags: ['Notification'],
    }),
    createNotification: builder.mutation({
      query: (notification) => ({
        url: '/notifications',
        method: 'POST',
        body: notification,
      }),
      invalidatesTags: ['Notification'],
    }),
    markAsRead: builder.mutation({
      query: (notificationId) => ({
        url: '/notifications',
        method: 'PUT',
        body: { action: 'markAsRead', notificationId },
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllAsRead: builder.mutation({
      query: () => ({
        url: '/notifications',
        method: 'PUT',
        body: { action: 'markAsRead' },
      }),
      invalidatesTags: ['Notification'],
    }),
    deleteNotification: builder.mutation({
      query: (notificationId) => ({
        url: '/notifications',
        method: 'PUT',
        body: { action: 'delete', notificationId },
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useCreateNotificationMutation,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} = notificationApi; 