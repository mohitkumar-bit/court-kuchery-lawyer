import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AppColors, ROUTES } from '@/constants';
import { useAuth } from '@/contexts';
import { lawyerService } from '@/services/lawyerService';

const { width } = Dimensions.get('window');

export default function LawyerDashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({
    totalEarnings: 0,
    availableBalance: 0,
    pendingBalance: 0,
    paidToBank: 0,
    totalConsultations: 0,
    totalClients: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await lawyerService.getStats();
      setStats(data);
    } catch (err) {
      console.error("FETCH STATS ERR", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[AppColors.primary]} />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.userName}>Adv. {user?.name?.split(' ')[0] ?? 'Lawyer'}</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={() => router.push(ROUTES.TABS.PROFILE as any)}>
            <Image source={require('@/assets/court/scale2.png')} style={styles.avatar} />
          </TouchableOpacity>
        </View>

        {/* Primary Wallet Card */}
        <LinearGradient
          colors={['#1a1f36', '#2a314f']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.walletCard}
        >
          <View style={styles.walletHeader}>
            <View>
              <Text style={styles.walletLabel}>Total Balance</Text>
              <Text style={styles.walletScale}>₹{stats.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
            </View>
            <TouchableOpacity
              style={styles.withdrawSmallBtn}
              onPress={() => router.push(ROUTES.TABS.WALLET as any)}
            >
              <Text style={styles.withdrawSmallText}>Withdraw</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.walletRow}>
            <View style={styles.walletItem}>
              <Text style={styles.walletRowLabel}>Pending</Text>
              <Text style={styles.walletRowValue}>₹{stats.pendingBalance.toFixed(0)}</Text>
            </View>
            <View style={styles.walletDivider} />
            <View style={styles.walletItem}>
              <Text style={styles.walletRowLabel}>Lifetime</Text>
              <Text style={styles.walletRowValue}>₹{stats.totalEarnings.toFixed(0)}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions Grid */}
        <Text style={styles.sectionTitle}>Manage Practice</Text>
        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => router.push(ROUTES.TABS.CHAT_HISTORY as any)}
          >
            <View style={[styles.iconBox, { backgroundColor: '#e0e7ff' }]}>
              <Ionicons name="briefcase" size={24} color="#4338ca" />
            </View>
            <Text style={styles.gridLabel}>My Cases</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => router.push(ROUTES.TABS.WALLET as any)}
          >
            <View style={[styles.iconBox, { backgroundColor: '#f0fdf4' }]}>
              <Ionicons name="card" size={24} color="#15803d" />
            </View>
            <Text style={styles.gridLabel}>Payouts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => router.push(ROUTES.TABS.PROFILE as any)}
          >
            <View style={[styles.iconBox, { backgroundColor: '#faf5ff' }]}>
              <Ionicons name="person-circle" size={24} color="#7e22ce" />
            </View>
            <Text style={styles.gridLabel}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem}>
            <View style={[styles.iconBox, { backgroundColor: '#fff7ed' }]}>
              <Ionicons name="notifications" size={24} color="#c2410c" />
            </View>
            <Text style={styles.gridLabel}>Alerts</Text>
          </TouchableOpacity>
        </View>

        {/* Practice Overview Card */}
        <View style={styles.ovCard}>
          <Text style={styles.ovTitle}>Profile Overview</Text>
          <View style={styles.ovList}>
            <View style={styles.ovItem}>
              <Ionicons name="medal-outline" size={18} color="#64748b" />
              <Text style={styles.ovLabel}>Specialization:</Text>
              <Text style={styles.ovValue}>{user?.specialization || 'General Practice'}</Text>
            </View>
            <View style={styles.ovItem}>
              <Ionicons name="cash-outline" size={18} color="#64748b" />
              <Text style={styles.ovLabel}>Your Rate:</Text>
              <Text style={styles.ovValue}>₹{user?.ratePerMinute || '0'}/min</Text>
            </View>
          </View>
          <View style={styles.statusBadge}>
            <View style={styles.dot} />
            <Text style={styles.statusText}>Accepting new cases</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    padding: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  walletCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#1a1f36',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  walletLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  walletScale: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  withdrawSmallBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  withdrawSmallText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
  },
  walletItem: {
    flex: 1,
    alignItems: 'center',
  },
  walletRowLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  walletRowValue: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  walletDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  gridItem: {
    width: (width - 40 - 12) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 10,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 16,
  },
  ovCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  ovTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  ovList: {
    gap: 12,
    marginBottom: 20,
  },
  ovItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ovLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  ovValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  statusText: {
    fontSize: 12,
    color: '#15803d',
    fontWeight: '700',
  },
});
