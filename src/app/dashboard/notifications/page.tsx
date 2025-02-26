"use client";

import React, { useCallback } from 'react';
import { useGetNotificationsQuery, useUpdateNotificationMutation } from '@/services/endpoints/notification';
import { INotification } from '@/models/Notification.model';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLoader from '@/components/ui/DashboardLoader';
import useUserAuthorised from '@/hooks/useUserAuthorised';

const NotificationsPage = () => {
  const { user, status } = useUserAuthorised();
  const userId = user?._id;
  const isAuthenticated = status === "authenticated";
  const [updateNotification, { isLoading: isUpdating }] = useUpdateNotificationMutation();

  const handleMarkAsRead = useCallback(async (id: string) => {
    try {
      await updateNotification({ id, read: true });
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  }, [updateNotification]);

  const { data: notifications, isLoading, isError } = useGetNotificationsQuery(userId, { skip: !isAuthenticated || !userId });

  if (isLoading) {
    return <DashboardLoader loading={true}>Loading notifications...</DashboardLoader>;
  }

  if (isError) {
    return <div>Failed to load notifications.</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Notifications</h1>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {notifications?.map((notification: INotification) => (
          <Card key={notification._id?.toString()}>
            <CardHeader>
              <CardTitle>{notification.type}</CardTitle>
              <CardDescription>{notification.createdAt.toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{notification.message}</p>
              <Button onClick={() => handleMarkAsRead(notification._id?.toString() || '')} disabled={isUpdating}>
                {notification.read ? 'Mark as Unread' : 'Mark as Read'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;