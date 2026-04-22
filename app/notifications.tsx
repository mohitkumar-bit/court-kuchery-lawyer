import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppColors } from '@/constants/theme';

type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'consultation' | 'wallet' | 'system';
  isRead: boolean;
};

const DUMMY_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'New Consultation Request',
    message: 'Rahul Sharma requested a video consultation. View details to accept.',
    time: '2 mins ago',
    type: 'consultation',
    isRead: false,
  },
  {
    id: '2',
    title: 'Withdrawal Successful',
    message: 'Your withdrawal of ₹5,000 has been processed successfully to your bank.',
    time: '1 hour ago',
    type: 'wallet',
    isRead: false,
  },
  {
    id: '3',
    title: 'Profile Verified',
    message: 'Congratulations! Your profile has been verified by the admin team.',
    time: '3 hours ago',
    type: 'system',
    isRead: true,
  },
  {
    id: '4',
    title: 'New Review Received',
    message: 'A client left a 5-star review for your last consultation.',
    time: '5 hours ago',
    type: 'consultation',
    isRead: false,
  },
  {
    id: '5',
    title: 'Earnings Summary',
    message: 'Your weekly earnings report for March 30 - April 5 is now available.',
    time: '1 day ago',
    type: 'wallet',
    isRead: true,
  },
  {
    id: '6',
    title: 'System Maintenance',
    message: 'The app will be under maintenance on Sunday from 2 AM to 4 AM.',
    time: '2 days ago',
    type: 'system',
    isRead: true,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState(DUMMY_NOTIFICATIONS);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'consultation':
        return { name: 'videocam-outline', color: '#3B82F6' };
      case 'wallet':
        return { name: 'wallet-outline', color: '#10B981' };
      case 'system':
        return { name: 'settings-outline', color: '#6B7280' };
      default:
        return { name: 'notifications-outline', color: AppColors.primary };
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const icon = getIcon(item.type);

    return (
      <TouchableOpacity
        style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: icon.color + '15' }]}>
          <Ionicons name={icon.name as any} size={24} color={icon.color} />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{item.title}</Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={12}
        >
          <Ionicons name="arrow-back" size={24} color={AppColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.markReadButton}>
          <Text style={styles.markReadText}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[AppColors.primary]}
            tintColor={AppColors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>
              When you receive updates about your cases or earnings, they will appear here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',

  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.text,
  },
  markReadButton: {
    padding: 4,
  },
  markReadText: {
    fontSize: 12,
    color: AppColors.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 1,
  },
  unreadItem: {
    backgroundColor: '#F0F7FF',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.text,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 6,
  },
  time: {
    fontSize: 12,
    color: '#94A3B8',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
