import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppColors, ROUTES } from '@/constants';
import { DUMMY_CLIENTS } from '@/data/dummyClients';
import type { Client } from '@/data/dummyClients';

export default function ClientsScreen() {
  const router = useRouter();

  const handleClientPress = (client: Client) => {
    router.push(`/chat-history/${client.id}`);
  };

  const renderClient = ({ item }: { item: Client }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleClientPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.avatar}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.caseType}>{item.caseType}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={AppColors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={AppColors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>My Clients</Text>
      </View>
      <FlatList
        data={DUMMY_CLIENTS}
        keyExtractor={(item) => item.id}
        renderItem={renderClient}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AppColors.border,
    gap: 16,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.text,
  },
  list: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.primary,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 2,
  },
  caseType: {
    fontSize: 13,
    color: AppColors.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  phone: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
});
