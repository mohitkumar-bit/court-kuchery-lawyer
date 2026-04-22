import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppColors, ROUTES } from '@/constants';
import { useAuth } from '@/contexts';

const MENU_ITEMS: { id: string; label: string; icon: string; route: Href<any> }[] = [
  { id: 'edit-profile', label: 'Edit Profile', icon: 'person-outline', route: '/edit-profile' },
  { id: 'my-cases', label: 'My Cases', icon: 'document-text-outline', route: ROUTES.TABS.MY_CASES },
  { id: 'clients', label: 'Clients', icon: 'people-outline', route: ROUTES.TABS.CLIENTS },
  { id: 'wallet', label: 'Earnings & Wallet', icon: 'wallet-outline', route: ROUTES.TABS.WALLET },
  { id: 'change-password', label: 'Change Password', icon: 'lock-closed-outline', route: ROUTES.TABS.CHANGE_PASSWORD },
  { id: 'about', label: 'About App', icon: 'information-circle-outline', route: ROUTES.TABS.ABOUT },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) ?? 'L'}</Text>
        </View>
        <Text style={styles.name}>Adv. {user?.name ?? 'Lawyer'}</Text>
        {/* <Text style={styles.specialization}>
          {user?.specialization && user.specialization.length > 0
            ? user.specialization.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')
            : 'Legal'} • {user?.experienceYears || '0'} yrs
        </Text> */}
        <Text style={styles.courtTypeContainer}>
          {user?.courtType && user.courtType.length > 0
            ? user.courtType.map((c, i) => (
              <View key={i} style={styles.courtBadge}>
                <Text style={styles.courtBadgeText}>{c}</Text>
              </View>
            ))
            : <View style={styles.courtBadge}><Text style={styles.courtBadgeText}>Civil Court</Text></View>
          }
        </Text>
        {/* <Text style={styles.rate}>₹{user?.ratePerMinute || '—'}/min</Text>
        <Text style={styles.email}>{user?.email ?? '—'}</Text>
        <Text style={styles.phone}>{user?.phone ?? '—'}</Text> */}

        {user?.address && (
          <View style={styles.locationContainer}>
            <Ionicons name="location-sharp" size={16} color={AppColors.primary} />
            <Text style={styles.addressText} numberOfLines={2}>
              {user.address}
              {user.district || user.state ? ` (${[user.district, user.state].filter(Boolean).join(', ')})` : ''}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.menu}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => router.push(item.route)}
            activeOpacity={0.7}
          >
            <Ionicons name={item.icon as any} size={22} color={AppColors.primary} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={AppColors.textSecondary} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={[styles.menuLabel, { color: '#EF4444' }]}>Logout</Text>
          <Ionicons name="chevron-forward" size={20} color="#EF4444" opacity={0.5} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: AppColors.white,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AppColors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.text,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: AppColors.white,
    padding: 24,
    borderRadius: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AppColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: AppColors.primary,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.text,
    marginBottom: 4,
  },
  specialization: {
    fontSize: 14,
    color: AppColors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  rate: {
    fontSize: 14,
    color: AppColors.success,
    fontWeight: '600',
    marginBottom: 8,
  },
  email: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 2,
  },
  phone: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    width: '100%',
    marginTop: 4,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: AppColors.text,
    lineHeight: 18,
    fontWeight: '500',
  },
  menu: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: AppColors.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AppColors.border,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: AppColors.text,
    fontWeight: '500',
  },
  courtTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 6,
    marginBottom: 8,
  },
  courtBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  courtBadgeText: {
    fontSize: 12,
    color: AppColors.primary,
    fontWeight: '700',
  },
});
