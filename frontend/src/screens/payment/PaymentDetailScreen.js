import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const PaymentDetailScreen = ({ route }) => {
  const { payment } = route.params;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusColor = () => {
    return payment.status === 'Paid' ? '#10B981' : '#EF4444';
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusHeader}>
          <View style={[styles.statusIcon, { backgroundColor: getStatusColor() + '20' }]}>
            <Ionicons 
              name={payment.status === 'Paid' ? "checkmark-circle" : "time"} 
              size={60} 
              color={getStatusColor()} 
            />
          </View>
          <Text style={[styles.statusTitle, { color: getStatusColor() }]}>
            Payment {payment.status}
          </Text>
          <Text style={styles.paymentId}>Ref: {payment._id.toUpperCase()}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Doctor Details</Text>
          <View style={styles.doctorInfo}>
            <View style={styles.avatar}>
              {payment.doctorId?.profileImage ? (
                <Image source={{ uri: payment.doctorId.profileImage }} style={styles.avatarImg} />
              ) : (
                <Ionicons name="person" size={24} color="#4F46E5" />
              )}
            </View>
            <View>
              <Text style={styles.doctorName}>Dr. {payment.doctorId?.name}</Text>
              <Text style={styles.doctorSpec}>{payment.doctorId?.specialization}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Appointment Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailValue}>
              {new Date(payment.appointmentId?.appointmentDate).toLocaleDateString()} at {payment.appointmentId?.appointmentTime}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Breakdown</Text>
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Consultation Fee</Text>
            <Text style={styles.billingValue}>Rs. {payment.consultationFee}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.billingRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>Rs. {payment.totalAmount}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Transaction Info</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <View style={styles.methodBadge}>
              <Text style={styles.methodText}>{payment.paymentMethod}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created At</Text>
            <Text style={styles.detailValue}>{formatDate(payment.createdAt)}</Text>
          </View>
          {payment.paidAt && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Paid At</Text>
              <Text style={styles.detailValue}>{formatDate(payment.paidAt)}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  statusHeader: { alignItems: 'center', marginVertical: 30 },
  statusIcon: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  statusTitle: { fontSize: 24, fontWeight: '800' },
  paymentId: { fontSize: 12, color: '#9CA3AF', marginTop: 4, letterSpacing: 1 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#6B7280', marginBottom: 12, textTransform: 'uppercase' },
  doctorInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImg: { width: 44, height: 44 },
  doctorName: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  doctorSpec: { fontSize: 13, color: '#6B7280' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  detailLabel: { fontSize: 14, color: '#6B7280' },
  detailValue: { fontSize: 14, color: '#1F2937', fontWeight: '600' },
  billingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  billingLabel: { fontSize: 14, color: '#6B7280' },
  billingValue: { fontSize: 14, color: '#1F2937', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  totalLabel: { fontSize: 16, fontWeight: '800', color: '#1F2937' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#4F46E5' },
  methodBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  methodText: { fontSize: 12, fontWeight: '700', color: '#374151' },
});

export default PaymentDetailScreen;
