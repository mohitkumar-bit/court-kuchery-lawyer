import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { Navbar, Sidebar } from '@/components/layout';
import { AppColors } from '@/constants/theme';
import { IncomingConsultModal } from '@/components/IncomingConsultModal';
import { useAuth } from '@/contexts';
import { consultService } from '@/services/consultService';
import { useRouter } from 'expo-router';

export default function TabLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const { user, activeRequest, clearRequest } = useAuth();
  const router = useRouter();

  // 🛡️ PROFILE COMPLETION GUARD
  React.useEffect(() => {
    if (user && !user.profileCompleted) {
      router.replace("/(auth)/complete-profile" as any);
    }
  }, [user, user?.profileCompleted]);

  const handleAccept = async () => {
    try {
      if (!activeRequest) return;
      await consultService.acceptSession(activeRequest.sessionId);
      const sessionId = activeRequest.sessionId;
      const type = activeRequest.type;
      clearRequest();

      // Navigate based on type
      if (type === "CALL") {
        router.push(`/call/${sessionId}` as any);
      } else {
        router.push(`/chat-history/${sessionId}` as any);
      }
    } catch (error) {
      console.error("Accept error:", error);
    }
  };

  const handleDecline = async () => {
    try {
      if (!activeRequest) return;
      await consultService.declineSession(activeRequest.sessionId);
      clearRequest();
    } catch (error) {
      console.error("Decline error:", error);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Platform.OS === 'web' ? 0 : 0,

        },
      ]}
    >
      {/* 🔹 Global Navbar */}
      <Navbar onMenuPress={() => setSidebarOpen(true)} />

      {/* 🔹 Tabs */}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: AppColors.primary,
          tabBarInactiveTintColor: AppColors.textSecondary,
          tabBarStyle: {
            backgroundColor: '#cadcff',
            borderTopColor: AppColors.border,

            // 🔥 FIXED TAB BAR HEIGHT
            height: 60 + insets.bottom,
            paddingTop: 6,
            paddingBottom: insets.bottom,
          },
          tabBarButton: HapticTab,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="grid-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="my-cases"
          options={{
            title: 'My Cases',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="briefcase-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="wallet"
          options={{
            title: 'Earnings',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="wallet-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />

        {/* 🔒 Hidden routes */}

        <Tabs.Screen name="lawyers" options={{ href: null }} />
        <Tabs.Screen name="clients" options={{ href: null }} />
        <Tabs.Screen name="change-password" options={{ href: null }} />
        <Tabs.Screen name="about" options={{ href: null }} />
        <Tabs.Screen name="lawyers/[id]" options={{ href: null }} />
        <Tabs.Screen name="chat-view/[id]" options={{ href: null }} />
        <Tabs.Screen name="chat-history" options={{ href: null }} />
        <Tabs.Screen name="chat-history/index" options={{ href: null }} />
        <Tabs.Screen name="chat-history/[id]" options={{ href: null }} />
      </Tabs>

      {/* 🔹 Global Sidebar */}
      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <IncomingConsultModal
        visible={!!activeRequest}
        request={activeRequest}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F7FF',

    // 🌐 Web breathing space
    ...(Platform.OS === 'web' && {
      paddingTop: 12,
      paddingBottom: 12,
    }),
  },
});
