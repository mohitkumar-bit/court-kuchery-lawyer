import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';

import { AppColors } from '@/constants/theme';
import { walletService } from '@/services/walletService';

type Transaction = {
  _id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  reason: string;
  createdAt: string;
};

export default function LawyerWalletScreen() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingAmount, setPendingAmount] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const balanceData = await walletService.getBalance();
      const txnData = await walletService.getTransactions();

      setBalance(balanceData.balance ?? 0);
      setTransactions(txnData.transactions || txnData || []);
      setPendingAmount(balanceData.pending ?? 0);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchWallet();
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);

    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (amount > balance) {
      Alert.alert('Insufficient Balance', 'You cannot withdraw more than available');
      return;
    }

    try {
      setWithdrawLoading(true);
      await walletService.withdraw(amount);
      setModalVisible(false);
      setWithdrawAmount('');
      await fetchWallet();
      Alert.alert('Withdrawal Successful', 'Funds have been transferred to your bank account.');
    } catch (error) {
      Alert.alert('Withdrawal Failed');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isCredit = item.type === 'CREDIT';

    return (
      <View style={styles.txnItem}>
        <View>
          <Text style={styles.txnReason}>{item.reason}</Text>
          <Text style={styles.txnDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <Text
          style={[
            styles.txnAmount,
            { color: isCredit ? AppColors.success : '#dc2626' },
          ]}
        >
          {isCredit ? '+' : '-'} ₹ {item.amount.toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings</Text>
        <Text style={styles.headerSubtitle}>Manage your income</Text>
      </View>

      <ScrollView 
        style={styles.scroll} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Pending vs Paid Cards */}
        <View style={styles.cardsRow}>
          <View style={[styles.balanceCard, styles.pendingCard]}>
            <View style={styles.cardHeader}>
              <Ionicons name="time-outline" size={22} color="rgba(255,255,255,0.95)" />
              <Text style={styles.cardLabel}>Pending</Text>
            </View>
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.cardAmount}>₹ {(pendingAmount ?? 0).toFixed(2)}</Text>
            )}
            <Text style={styles.cardHint}>From consultations</Text>
          </View>

          <View style={[styles.balanceCard, styles.paidCard]}>
            <View style={styles.cardHeader}>
              <Ionicons name="wallet-outline" size={22} color="rgba(255,255,255,0.95)" />
              <Text style={styles.cardLabel}>Available</Text>
            </View>
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.cardAmount}>₹ {balance.toFixed(2)}</Text>
            )}
            <Text style={styles.cardHint}>Ready to withdraw</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.withdrawBtn}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="arrow-down-circle-outline" size={22} color={AppColors.white} />
          <Text style={styles.withdrawText}>Withdraw</Text>
        </TouchableOpacity>

        {/* Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>

          {loading ? (
            <ActivityIndicator color={AppColors.primary} style={{ marginTop: 20 }} />
          ) : transactions.length === 0 ? (
            <View style={styles.emptyTxn}>
              <Ionicons name="receipt-outline" size={48} color={AppColors.textSecondary} />
              <Text style={styles.emptyTxnText}>No transactions yet</Text>
              <Text style={styles.emptyTxnSub}>Earnings from consultations will appear here</Text>
            </View>
          ) : (
            <FlatList
              data={transactions}
              keyExtractor={(item) => item._id}
              renderItem={renderTransaction}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Withdraw Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Withdraw Amount</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter amount (₹)"
              keyboardType="numeric"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
            />

            <TouchableOpacity
              style={styles.rechargeBtn}
              onPress={handleWithdraw}
              disabled={withdrawLoading}
            >
              {withdrawLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.rechargeText}>Withdraw</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.cancelBtn}
            >
              <Text style={{ color: AppColors.textSecondary }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.background },

  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: AppColors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginTop: 4,
  },

  scroll: {
    flex: 1,
  },

  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  balanceCard: {
    flex: 1,
    borderRadius: 16,
    padding: 18,
  },
  pendingCard: {
    backgroundColor: '#f59e0b',
  },
  paidCard: {
    backgroundColor: AppColors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  cardAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.white,
    marginBottom: 4,
  },
  cardHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
  },

  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: AppColors.success,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 24,
  },
  withdrawText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.white,
  },

  section: { paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: AppColors.text,
  },

  emptyTxn: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTxnText: {
    fontSize: 16,
    fontWeight: '500',
    color: AppColors.text,
    marginTop: 12,
  },
  emptyTxnSub: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginTop: 4,
  },

  txnItem: {
    backgroundColor: AppColors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  txnReason: { fontWeight: '600', color: AppColors.text },
  txnDate: { fontSize: 12, color: AppColors.textSecondary, marginTop: 4 },
  txnAmount: { fontWeight: '700', fontSize: 15 },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    backgroundColor: AppColors.white,
    margin: 20,
    padding: 24,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: AppColors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    color: AppColors.text,
  },
  rechargeBtn: {
    backgroundColor: AppColors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  rechargeText: {
    color: AppColors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  cancelBtn: {
    alignItems: 'center',
    marginTop: 12,
  },
});
