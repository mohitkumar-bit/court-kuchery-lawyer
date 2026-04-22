import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { AppColors } from '@/constants/theme';
import { consultService } from '@/services/consultService';

export default function MyCasesScreen() {
  const router = useRouter();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConsultations = async () => {
    try {
      const res = await consultService.getLawyerConsultations();
      setConsultations(res.consultations || []);
    } catch (error) {
      console.error("FETCH LAWYER CONSULTS ERR", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConsultations();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return AppColors.primary;
      case 'ENDED': return AppColors.success;
      case 'FORCE_ENDED': return '#ef4444';
      case 'CANCELLED': return '#64748b';
      case 'DECLINED': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  const renderCase = ({ item }: { item: any }) => {
    const date = new Date(item.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/consult-details/${item._id}` as any)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.clientInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.userId?.name?.charAt(0) || '?'}</Text>
            </View>
            <View>
              <Text style={styles.clientName}>{item.userId?.name || 'Unknown Client'}</Text>
              <Text style={styles.caseType}>{item.type || 'Consultation'}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Ionicons name="calendar-outline" size={14} color="#64748b" />
            <Text style={styles.footerText}>{date}</Text>
          </View>
          {/* <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={14} color="#64748b" />
            <Text style={styles.footerText}>{item.duration || 0} mins</Text>
          </View> */}
          <View style={styles.footerItem}>
            <Ionicons name="wallet-outline" size={14} color="#64748b" />
            <Text style={styles.footerText}>₹{item.totalAmount?.toFixed(2) || '0.00'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cases</Text>
      </View>

      {
        loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={AppColors.primary} />
          </View>
        ) : (
          <FlatList
            data={consultations}
            keyExtractor={(item) => item._id}
            renderItem={renderCase}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[AppColors.primary]} />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="briefcase-outline" size={64} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No cases found</Text>
                <Text style={styles.emptyText}>Your consultation history will appear here</Text>
              </View>
            }
          />
        )
      }
    </View >
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
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4338CA',
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  caseType: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
  },
});
