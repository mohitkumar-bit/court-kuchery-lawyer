import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';

import { AppColors, ROUTES } from '@/constants';
import { useAuth } from '@/contexts';


type NavbarProps = {
  onMenuPress?: () => void;
};

export function Navbar({ onMenuPress }: NavbarProps) {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconButton} onPress={onMenuPress} hitSlop={12}>
        <Ionicons name="menu" size={28} color={AppColors.text} />
      </TouchableOpacity>
      <View style={styles.logoContainer}>
        <Image source={require('@/assets/court/logo2.png')} style={styles.logo} />

      </View>
      <View style={styles.rightRow}>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => router.push('/notifications')}
          hitSlop={12}
        >
          <Ionicons name="notifications-outline" size={24} color={AppColors.text} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>4</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => router.push(ROUTES.TABS.PROFILE)}
          hitSlop={12}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) ?? 'U'}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#cadcff",
    paddingTop: 40,
  },
  iconButton: {
    padding: 4,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 20,
  },
  logo: {
    width: 100,
    height: 37,
  },
  logoBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.primary,
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarButton: {
    padding: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.primary,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#cadcff',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
