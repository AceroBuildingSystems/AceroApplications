"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import Loader from "../ui/Loader";
import { usePathname } from "next/navigation";
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from '@/store/services/notificationService';

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

export function NavUser({
  user,
}: {
  user: {
    displayName: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const [customLoadingState, setCustomLoadingState] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();

  // Fetch notifications using RTK Query
  const { data: notificationsData, isLoading } = useGetNotificationsQuery({
    limit: 20,
    skip: 0,
    status: 'ALL'
  });

  // Mark as read mutation
  const [markAsRead] = useMarkAsReadMutation();

  // Mark all as read mutation
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const unreadCount = notificationsData?.notifications?.filter(
    (n: Notification) => n.status === 'UNREAD'
  ).length || 0;

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.status === 'UNREAD') {
      await markAsRead(notification._id);
    }
    
    // Close the notifications view
    setShowNotifications(false);
    
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
          console.log('No specific navigation for this notification type');
          break;
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  return (
    <Loader loading={customLoadingState}>
      <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.avatar} alt={user?.displayName} />
                <AvatarFallback className="rounded-lg">
                  {user?.displayName?.toProperCase()?.split(" ")[0][0] + (user?.displayName?.toProperCase()?.split(" ")[1]?.[0] || "")}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.displayName?.toProperCase()}</span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.avatar} alt={user?.displayName?.toProperCase()} />
                  <AvatarFallback className="rounded-lg">
                  {user?.displayName?.toProperCase()?.split(" ")[0][0] + (user?.displayName?.toProperCase()?.split(" ")[1]?.[0] || "")}
                </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user?.displayName?.toProperCase()}</span>
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
       
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
             
              <DropdownMenuItem onClick={() => setShowNotifications(!showNotifications)}>
                <Bell />
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </DropdownMenuItem>
            </DropdownMenuGroup>

            {showNotifications && (
              <>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Notifications</h4>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                      >
                        Mark all as read
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="h-[300px]">
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
                </div>
              </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      </SidebarMenu>
    </Loader>
  )
}
