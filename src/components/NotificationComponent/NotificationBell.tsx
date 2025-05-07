import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'APPROVAL_REQUEST' | 'APPROVAL_ACTION' | 'SYSTEM' | 'INFO';
  status: 'UNREAD' | 'READ';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: string;
  sender: {
    firstName: string;
    lastName: string;
    displayName: string;
  };
  relatedEntity?: {
    type: string;
    id: string;
  };
}

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAsRead', notificationId }),
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAsRead' }),
      });
      if (!response.ok) throw new Error('Failed to mark all notifications as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
  });

  const unreadCount = notificationsData?.notifications?.filter(
    (n: Notification) => n.status === 'UNREAD'
  ).length || 0;

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.status === 'UNREAD') {
      await markAsReadMutation.mutateAsync(notification._id);
    }
    
    // Close the notification popover
    setIsOpen(false);
    
    // Handle navigation based on notification type and related entity
    if (notification.relatedEntity) {
      switch (notification.relatedEntity.type) {
        case 'REQUISITION':
          router.push(`/dashboard/requisitions/${notification.relatedEntity.id}`);
          break;
        case 'USER':
          router.push(`/dashboard/master/user/${notification.relatedEntity.id}`);
          break;
        case 'DEPARTMENT':
          router.push(`/dashboard/master/department/${notification.relatedEntity.id}`);
          break;
        case 'ORGANISATION':
          router.push(`/dashboard/master/organisation/${notification.relatedEntity.id}`);
          break;
        case 'LOCATION':
          router.push(`/dashboard/master/location/${notification.relatedEntity.id}`);
          break;
        case 'DESIGNATION':
          router.push(`/dashboard/master/designation/${notification.relatedEntity.id}`);
          break;
        case 'ROLE':
          router.push(`/dashboard/master/role/${notification.relatedEntity.id}`);
          break;
        case 'EMPLOYEE_TYPE':
          router.push(`/dashboard/master/employee-type/${notification.relatedEntity.id}`);
          break;
        default:
          // For notifications without specific navigation
          console.log('No specific navigation for this notification type');
          break;
      }
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 text-center">Loading...</div>
          ) : notificationsData?.notifications?.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No notifications</div>
          ) : (
            <div className="divide-y">
              {notificationsData?.notifications?.map((notification: Notification) => (
                <div
                  key={notification._id}
                  className={cn(
                    "p-4 cursor-pointer hover:bg-gray-50 transition-colors",
                    notification.status === 'UNREAD' && "bg-blue-50"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    {notification.status === 'UNREAD' && (
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell; 