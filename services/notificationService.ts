import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
  deleteNotification as apiDeleteNotification,
  getMyNotifications as apiGetNotifications,
  markAllNotificationsAsRead as apiMarkAllRead,
  markNotificationAsRead as apiMarkRead,
} from './api';
import haptic from '../utils/haptics';

export interface AppNotification {
  _id: string;
  title: string;
  body: string;
  type: 'order' | 'message' | 'quote' | 'delivery' | 'system';
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

// Configure foreground notifications presentation handler
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

class NotificationService {
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized || Platform.OS === 'web') return;

    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'GoPickup Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#439D25',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      this.initialized = true;
    } catch (error) {
      console.log('Notification service initialization note:', error);
    }
  }

  /**
   * Schedules an instant local notification banner with sound and badge.
   * If on iOS, triggers haptic feedback.
   */
  async presentLocalNotification(params: {
    title: string;
    body: string;
    type?: AppNotification['type'];
    data?: Record<string, any>;
  }): Promise<void> {
    const { title, body, type = 'system', data = {} } = params;

    // Trigger iOS Haptic feedback
    if (type === 'quote' || type === 'order') {
      await haptic.successNotification();
    } else {
      await haptic.lightImpact();
    }

    if (Platform.OS === 'web') return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { ...data, type },
          sound: true,
        },
        trigger: null, // immediate
      });
    } catch (e) {
      console.log('Local notification display skipped:', e);
    }
  }

  /**
   * Fetches notifications from backend, syncing with local cache.
   * Falls back to local storage if offline.
   */
  async getNotifications(userId?: string): Promise<AppNotification[]> {
    const cacheKey = userId ? `@cached_notifications:${userId}` : '@cached_notifications:default';

    try {
      const response = await apiGetNotifications();
      if (response && Array.isArray(response.data)) {
        await AsyncStorage.setItem(cacheKey, JSON.stringify(response.data));
        await this.syncBadgeCount(response.data);
        return response.data;
      }
    } catch {
      // Backend unavailable or network offline, fallback to cache
    }

    const cached = await AsyncStorage.getItem(cacheKey);
    const notifications: AppNotification[] = cached ? JSON.parse(cached) : [];
    await this.syncBadgeCount(notifications);
    return notifications;
  }

  /**
   * Mark single notification as read

   */
  async markAsRead(id: string, userId?: string): Promise<void> {
    const cacheKey = userId ? `@cached_notifications:${userId}` : '@cached_notifications:default';

    // Optimistically update local cache
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const list: AppNotification[] = JSON.parse(cached);
        const updated = list.map((item) => (item._id === id ? { ...item, isRead: true } : item));
        await AsyncStorage.setItem(cacheKey, JSON.stringify(updated));
        await this.syncBadgeCount(updated);
      }
    } catch (e) {
      console.log('Error updating local cache:', e);
    }

    // Attempt backend sync
    try {
      await apiMarkRead(id);
    } catch {
      // Offline fallback already updated
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId?: string): Promise<void> {
    const cacheKey = userId ? `@cached_notifications:${userId}` : '@cached_notifications:default';

    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const list: AppNotification[] = JSON.parse(cached);
        const updated = list.map((item) => ({ ...item, isRead: true }));
        await AsyncStorage.setItem(cacheKey, JSON.stringify(updated));
        await this.syncBadgeCount(updated);
      }
    } catch (e) {
      console.log('Error updating local cache:', e);
    }

    try {
      await apiMarkAllRead();
    } catch {
      // Offline fallback
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: string, userId?: string): Promise<void> {
    const cacheKey = userId ? `@cached_notifications:${userId}` : '@cached_notifications:default';

    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const list: AppNotification[] = JSON.parse(cached);
        const updated = list.filter((item) => item._id !== id);
        await AsyncStorage.setItem(cacheKey, JSON.stringify(updated));
        await this.syncBadgeCount(updated);
      }
    } catch (e) {
      console.log('Error deleting from cache:', e);
    }

    try {
      await apiDeleteNotification(id);
    } catch {
      // Offline fallback
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId?: string): Promise<number> {
    const list = await this.getNotifications(userId);
    return list.filter((n) => !n.isRead).length;
  }

  /**
   * Sync app icon badge count (iOS supported)
   */
  private async syncBadgeCount(notifications: AppNotification[]): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      const count = notifications.filter((n) => !n.isRead).length;
      await Notifications.setBadgeCountAsync(count);
    } catch {
      // Ignored
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
