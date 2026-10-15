import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import notificationService, { AppNotification } from '../../services/notificationService';
import haptic from '../../utils/haptics';

type FilterType = 'all' | 'order' | 'quote' | 'message' | 'system';

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const list = await notificationService.getNotifications(user?._id);
      setNotifications(list);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?._id]);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  const handleRefresh = async () => {
    await haptic.lightImpact();
    setRefreshing(true);
    await loadNotifications();
  };

  const handleFilterChange = async (newFilter: FilterType) => {
    await haptic.selection();
    setFilter(newFilter);
  };

  const handleMarkAllAsRead = async () => {
    await haptic.mediumImpact();
    await notificationService.markAllAsRead(user?._id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await haptic.successNotification();
  };

  const handleNotificationPress = async (item: AppNotification) => {
    await haptic.lightImpact();

    if (!item.isRead) {
      await notificationService.markAsRead(item._id, user?._id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n))
      );
    }

    // Action routing based on notification type
    if (item.type === 'message') {
      router.push({
        pathname: '/tabs/chat' as any,
        params: item.data?.senderId ? { recipientId: item.data.senderId } : {},
      });
    } else if (item.type === 'order' || item.type === 'quote' || item.type === 'delivery') {
      if (user?.role === 'admin') {
        router.push('/tabs/admin_home' as any);
      } else {
        router.push('/tabs/home' as any);
      }
    }
  };

  const handleDelete = async (id: string) => {
    await haptic.heavyImpact();
    await notificationService.deleteNotification(id, user?._id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'order') return item.type === 'order' || item.type === 'delivery';
    return item.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getTypeIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'quote':
        return { name: 'pricetag' as const, bg: '#EBF7EA', color: '#439D25' };
      case 'order':
        return { name: 'cube' as const, bg: '#E3F2FD', color: '#1976D2' };
      case 'delivery':
        return { name: 'navigate' as const, bg: '#E8F5E9', color: '#2E7D32' };
      case 'message':
        return { name: 'chatbubble' as const, bg: '#FFF8E1', color: '#F57F17' };
      default:
        return { name: 'notifications' as const, bg: '#F3F4F6', color: '#6B7280' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={async () => {
              await haptic.lightImpact();
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/tabs/home' as any);
              }
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 ? (
              <Text style={styles.headerSubtitle}>{unreadCount} unread update{unreadCount > 1 ? 's' : ''}</Text>
            ) : (
              <Text style={styles.headerSubtitle}>All caught up</Text>
            )}
          </View>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-done" size={16} color="#439D25" style={{ marginRight: 4 }} />
            <Text style={styles.markAllText}>Mark read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {(
            [
              { key: 'all', label: 'All' },
              { key: 'order', label: 'Orders' },
              { key: 'quote', label: 'Quotes' },
              { key: 'message', label: 'Messages' },
              { key: 'system', label: 'Updates' },
            ] as const
          ).map((item) => {
            const isActive = filter === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => handleFilterChange(item.key)}
                activeOpacity={0.75}
              >
                <Text
                  style={[styles.filterPillText, isActive && styles.filterPillTextActive]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#439D25" />
          <Text style={styles.loadingText}>Loading notifications…</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={[
            styles.listContent,
            filteredNotifications.length === 0 && styles.listContentEmpty,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#439D25']}
              tintColor="#439D25"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="notifications-off-outline" size={44} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'all'
                  ? "We'll alert you here as soon as there are delivery updates, quotes, or new messages."
                  : `You don't have any ${filter} notifications right now.`}
              </Text>
            </View>
          ) : (
            filteredNotifications.map((item) => {
              const iconInfo = getTypeIcon(item.type);
              return (
                <TouchableOpacity
                  key={item._id}
                  style={[
                    styles.notificationCard,
                    !item.isRead && styles.notificationCardUnread,
                  ]}
                  onPress={() => handleNotificationPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconContainer, { backgroundColor: iconInfo.bg }]}>
                    <Ionicons name={iconInfo.name} size={22} color={iconInfo.color} />
                  </View>

                  <View style={styles.textContainer}>
                    <View style={styles.cardHeaderRow}>
                      <Text
                        style={[
                          styles.cardTitle,
                          !item.isRead && styles.cardTitleUnread,
                        ]}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      <Text style={styles.timeText}>
                        {formatRelativeTime(item.createdAt)}
                      </Text>
                    </View>

                    <Text style={styles.cardBody} numberOfLines={2}>
                      {item.body}
                    </Text>
                  </View>

                  <View style={styles.cardRightActions}>
                    {!item.isRead && <View style={styles.unreadDot} />}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDelete(item._id);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="close" size={16} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 20) + 10 : 12,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF7EA',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#439D25',
  },
  filterContainer: {
    paddingVertical: 10,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEEEEE',
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterPillActive: {
    backgroundColor: '#439D25',
    borderColor: '#439D25',
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 120,
    gap: 12,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    alignItems: 'flex-start',
  },
  notificationCardUnread: {
    backgroundColor: '#F8FDF7',
    borderColor: '#D4EED0',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
    marginRight: 8,
  },
  cardTitleUnread: {
    color: '#111827',
    fontWeight: '700',
  },
  timeText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  cardBody: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  cardRightActions: {
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    paddingVertical: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#439D25',
  },
  deleteButton: {
    padding: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginTop: 40,
  },
  emptyIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
