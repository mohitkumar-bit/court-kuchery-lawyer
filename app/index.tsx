import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppColors, ROUTES } from '@/constants';
import { useAuth } from '@/contexts';

export default function IndexScreen() {
  const router = useRouter();
  const { isRestoring, hasCompletedSplash, isLoggedIn, activeSessionId } = useAuth();

  useEffect(() => {
    // ⛔️ Wait until auth restoration completes
    if (isRestoring) return;

    // 🔐 If not logged in AND hasn't seen welcome → go to welcome
    if (!isLoggedIn && !hasCompletedSplash) {
      router.replace('/(splash)/welcome');
      return;
    }

    // 🔐 If not logged in → go to login
    if (!isLoggedIn) {
      router.replace(ROUTES.AUTH.LOGIN);
      return;
    }

    // 💬 If user has active session → resume chat
    if (activeSessionId) {
      router.replace(`/chat-history/${activeSessionId}`);
      return;
    }

    // ✅ Otherwise → go to main tabs
    router.replace(ROUTES.TABS.ROOT);

  }, [isRestoring, hasCompletedSplash, isLoggedIn, activeSessionId]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={AppColors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.background,
  },
});