import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../../api/axiosInstance';
import CustomButton from '../../components/CustomButton';

const PAYMENT_METHODS = [
  { key: 'Card', icon: 'card-outline', label: 'Credit/Debit Card' },
  { key: 'Cash', icon: 'cash-outline', label: 'Cash Payment' },
  { key: 'Online', icon: 'globe-outline', label: 'Online Banking' },
];

const PaymentScreen = ({ route, navigation }) => {
  const { appointment, doctor } = route.params || {};
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);

  const amount = doctor?.consultationFee || appointment?.doctorId?.consultationFee || 0;
  const doctorName = doctor?.name || appointment?.doctorId?.name || 'Unknown';
  const doctorId = doctor?._id || appointment?.doctorId?._id;
  const appointmentId = appointment?._id;

  const handlePayment = async () => {
    if (!paymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post('/payments/create-manual', {
        appointmentId,
        doctorId,
        consultationFee: amount,
        totalAmount: amount,
        paymentMethod,
      });
      Alert.alert('Success', 'Payment recorded successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Appointment Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Payment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Doctor</Text>
            <Text style={styles.summaryValue}>Dr. {doctorName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date</Text>
            <Text style={styles.summaryValue}>
              {appointment?.appointmentDate
                ? new Date(appointment.appointmentDate).toLocaleDateString()
                : 'N/A'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Time</Text>
            <Text style={styles.summaryValue}>{appointment?.appointmentTime || 'N/A'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>Rs. {amount}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.key}
              style={[styles.methodCard, paymentMethod === method.key && styles.methodCardActive]}
              onPress={() => setPaymentMethod(method.key)}
            >
              <View style={[styles.methodIcon, paymentMethod === method.key && styles.methodIconActive]}>
                <Ionicons name={method.icon} size={22} color={paymentMethod === method.key ? '#4F46E5' : '#6B7280'} />
              </View>
              <Text style={[styles.methodLabel, paymentMethod === method.key && styles.methodLabelActive]}>
                {method.label}
              </Text>
              <View style={[styles.radio, paymentMethod === method.key && styles.radioActive]}>
                {paymentMethod === method.key && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actions}>
          <CustomButton
            title={`Pay Rs. ${amount}`}
            onPress={handlePayment}
            loading={loading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { padding: 16, paddingBottom: 30 },
  summaryCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20,
    marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  summaryTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 16 },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10,
  },
  summaryLabel: { fontSize: 14, color: '#6B7280' },
  summaryValue: { fontSize: 14, color: '#1F2937', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  totalAmount: { fontSize: 24, fontWeight: '800', color: '#4F46E5' },
  section: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20,
    marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 14 },
  methodCard: {
    flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E5E7EB', marginBottom: 10, backgroundColor: '#F9FAFB',
  },
  methodCardActive: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  methodIcon: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  methodIconActive: { backgroundColor: '#E0E7FF' },
  methodLabel: { flex: 1, fontSize: 15, color: '#374151', fontWeight: '500' },
  methodLabelActive: { color: '#4F46E5', fontWeight: '700' },
  radio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center',
  },
  radioActive: { borderColor: '#4F46E5' },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#4F46E5' },
  actions: { marginTop: 4 },
});

export default PaymentScreen;
