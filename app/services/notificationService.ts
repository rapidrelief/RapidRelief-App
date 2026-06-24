import AsyncStorage from "@react-native-async-storage/async-storage";

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const STORAGE_KEY = "@notifications";

export type NotificationType = "sos" | "flood" | "success" | "info" | "alert";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: number;
  isUnread: boolean;
}

export const saveNotifications = async (data: AppNotification[]) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getNotifications = async (): Promise<AppNotification[]> => {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const MAX_NOTIFICATIONS = 5;

export const addNotification = async (notification: AppNotification) => {
  const existing = await getNotifications();

  // ✅ avoid duplicate spam (same title + message)
  const isDuplicate = existing[0]?.title === notification.title &&
                      existing[0]?.message === notification.message;

  if (isDuplicate) return existing;

  // ✅ enforce max limit
  const updated = [notification, ...existing].slice(0, MAX_NOTIFICATIONS);

  await saveNotifications(updated);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: notification.title,
      body: notification.message,
    },
    trigger: null,
  });

  return updated;
};

export const markAllRead = async () => {
  const existing = await getNotifications();
  const updated = existing.map(n => ({ ...n, isUnread: false }));
  await saveNotifications(updated);
  return updated;
};

export const clearNotifications =  async () => {
    await saveNotifications([]);
    return [];
};



export const registerForPushNotifications = async () => {
  if (!Device.isDevice) return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return;

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  console.log("Push Token:", token);

  return token;
};

export const getTimeAgo = (timestamp: number) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};