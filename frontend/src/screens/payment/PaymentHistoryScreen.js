import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axiosInstance from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';

const paymentStatusColors = {
  Pending: { bg: '#FEF3C7', text: '#D97706' },
  Completed: { bg: '#D1FAE5', text: '#059669' },
  Refunded: { bg: '#FEE2E2', text: '#DC2626' },
};

const PaymentHistoryScreen = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPayments = async () => {
    try {
      const response = await axiosInstance.get('/payments/my');
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPayments();
    }, [])
  );

  const renderPayment = ({ item }) => {
    const colors = paymentStatusColors[item.paymentStatus] || paymentStatusColors.Pending;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <Ionicons name="receipt" size={22} color="#4F46E5" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.txnId}>{item.transactionId}</Text>
            <Text style={styles.doctorName}>Dr. {item.doctorId?.name || 'Unknown'}</Text>
          </View>
          <Text style={styles.amount}>Rs. {item.amount}</Text>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.dateText}>
              {new Date(item.paymentDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.methodRow}>
            <Ionicons name="card-outline" size={14} color="#6B7280" />
            <Text style={styles.dateText}>{item.paymentMethod}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.statusText, { color: colors.text }]}>{item.paymentStatus}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) return <LoadingSpinner message="Loading payment history..." />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={payments}
        keyExtractor={(item) => item._id}
        renderItem={renderPayment}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPayments(); }} colors={['#4F46E5']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyText}>No payment history</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  listContent: { padding: 16, paddingBottom: 20 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16,
    marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  cardInfo: { flex: 1 },
  txnId: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  doctorName: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginTop: 1 },
  amount: { fontSize: 16, fontWeight: '800', color: '#4F46E5' },
  cardFooter: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  methodRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  dateText: { fontSize: 12, color: '#6B7280' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, color: '#9CA3AF', marginTop: 12 },
});

export default PaymentHistoryScreen;
