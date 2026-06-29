import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const statusColors = {
  Unpaid: { bg: '#FEE2E2', text: '#DC2626' },
  Paid: { bg: '#D1FAE5', text: '#059669' },
};

const PaymentListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');

  const fetchPayments = async () => {
    try {
      let endpoint = '';
      if (user?.role === 'admin') {
        endpoint = filter === 'All' ? '/payments' : `/payments?status=${filter}`;
      } else if (user?.role === 'doctor') {
        endpoint = `/payments/doctor/${user._id}`;
      } else {
        endpoint = `/payments/patient/${user._id}`;
      }

      const response = await axiosInstance.get(endpoint);
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
    }, [filter])
  );

  const renderPayment = ({ item }) => {
    const colors = statusColors[item.status] || statusColors.Unpaid;
    const isPatient = user?.role === 'patient';
    const isDoctor = user?.role === 'doctor';
    
    const displayName = isPatient 
      ? `Dr. ${item.doctorId?.name || 'Unknown'}` 
      : (item.patientId?.name || 'Unknown Patient');

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('PaymentDetail', { payment: item })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardLeft}>
            <View style={styles.iconBox}>
              <Ionicons name="cash-outline" size={22} color="#4F46E5" />
            </View>
            <View>
              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.statusText, { color: colors.text }]}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Total Amount:</Text>
            <Text style={styles.amountValue}>Rs. {item.totalAmount}</Text>
          </View>
          <View style={styles.methodBadge}>
            <Ionicons name={item.paymentMethod === 'Card' ? "card-outline" : "cash-outline"} size={12} color="#6B7280" />
            <Text style={styles.methodText}>{item.paymentMethod}</Text>
          </View>
        </View>

        {isDoctor && item.paymentMethod === 'Cash' && item.status === 'Unpaid' && (
          <TouchableOpacity 
            style={styles.markPaidBtn}
            onPress={async () => {
              try {
                await axiosInstance.put(`/payments/${item._id}/mark-paid`);
                fetchPayments();
              } catch (err) {
                console.error(err);
              }
            }}
          >
            <Text style={styles.markPaidBtnText}>Mark as Paid</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) return <LoadingSpinner message="Loading payments..." />;

  const filterOptions = ['All', 'Paid', 'Unpaid'];

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {user?.role === 'admin' && (
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {filterOptions.map(f => (
              <TouchableOpacity 
                key={f} 
                style={[styles.filterChip, filter === f && styles.filterChipActive]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
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
            <Text style={styles.emptyText}>No payments found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  listContent: { padding: 16 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  name: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  date: { fontSize: 12, color: '#6B7280', marginTop: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardFooter: {
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  amountLabel: { fontSize: 13, color: '#6B7280' },
  amountValue: { fontSize: 15, fontWeight: '800', color: '#4F46E5' },
  methodBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F9FAFB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  methodText: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
  filterContainer: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  filterChipActive: { backgroundColor: '#EEF2FF', borderColor: '#4F46E5' },
  filterChipText: { color: '#6B7280', fontWeight: '600', fontSize: 13 },
  filterChipTextActive: { color: '#4F46E5' },
  emptyContainer: { alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: 16, color: '#9CA3AF', marginTop: 12, fontWeight: '600' },
  markPaidBtn: {
    marginTop: 12, backgroundColor: '#10B981', paddingVertical: 8, borderRadius: 8, alignItems: 'center'
  },
  markPaidBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
});

export default PaymentListScreen;
