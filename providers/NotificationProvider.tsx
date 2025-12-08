"use client";

import React, { createContext, useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface Notification {
  id: string;
  type: "post_created" | "user_joined" | "view_milestone";
  title: string;
  message: string;
  timestamp: string | Date;
  priority?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refetchNotifications: () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
}

const NOTIFICATION_QUERY_KEY = ["notifications"];

export function NotificationProvider({ children }: NotificationProviderProps) {
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications with caching (1 hour cache from backend)
  const { data, isLoading, refetch } = useQuery({
    queryKey: NOTIFICATION_QUERY_KEY,
    queryFn: async () => {
      const response = await fetch("/api/notifications");
      if (!response.ok) throw new Error("Failed to fetch notifications");
      const result = await response.json();
      return result.data as Notification[];
    },
    staleTime: 60 * 1000, // Cache for 1 minute in memory
    gcTime: 60 * 60 * 1000, // Keep in memory for 1 hour
    refetchInterval: 60 * 1000, // Auto-refetch every 1 minute
  });

  // Update unread count
  useCallback(() => {
    if (data) {
      setUnreadCount(data.length);
    }
  }, [data]);


  //   useEffect(() => {
  //   if (data) {
  //     setUnreadCount(data.length);
  //   }
  // }, [data]);

  // Simple mark as read (notifications auto-clear after 7 days)
  const markAsRead = useCallback(
    async (notificationId: string) => {
      await refetch();
    },
    [refetch]
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Delete notification (not needed - auto-clear after 7 days)
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      await refetch();
    },
    [refetch]
  );

  const value: NotificationContextType = {
    notifications: data || [],
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetchNotifications: refetch,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// Custom hook to use notifications
export function useNotifications() {
  const context = React.useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}
