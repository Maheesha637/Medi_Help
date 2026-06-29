import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../../components/CustomButton';

const paymentMethods = [
  { id: 'Card', label: 'Card Payment', icon: 'card-outline' },
  { id: 'PayPal', label: 'PayPal', icon: 'logo-paypal' },
  { id: 'Cash', label: 'Cash at Reception', icon: 'cash-outline' },
  { id: 'Insurance', label: 'Insurance Claim', icon: 'shield-checkmark-outline' },
];

const PaymentSummaryScreen = ({ route, navigation }) => {
  const { payment } = route.params;
  const [selectedMethod, setSelectedMethod] = useState(null);

  const handleConfirm = () => {
    if (!selectedMethod) {
      Alert.alert('Selection Required', 'Please select a payment method to proceed.');
      return;
    }

    switch (selectedMethod) {
      case 'Card':
        navigation.navigate('CardPayment', { payment });
        break;
      case 'Cash':
        navigation.navigate('CashPayment', { payment });
        break;
      case 'PayPal':
        navigation.navigate('PayPalPayment', { payment });
        break;
      case 'Insurance':
        navigation.navigate('InsurancePayment', { payment });
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Payment Summary</Text>
          <Text style={styles.subtitle}>Complete your appointment payment</Text>
        </View>

        <View style={styles.doctorCard}>
          <View style={styles.doctorAvatar}>
            {payment.doctorId?.profileImage ? (
              <Image source={{ uri: payment.doctorId.profileImage }} style={styles.avatarImg} />
            ) : (
              <Ionicons name="person" size={30} color="#4F46E5" />
            )}
          </View>
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>Dr. {payment.doctorId?.name}</Text>
            <Text style={styles.doctorSpec}>{payment.doctorId?.specialization}</Text>
            <Text style={styles.apptTime}>
              {new Date(payment.appointmentId?.appointmentDate).toLocaleDateString()} at {payment.appointmentId?.appointmentTime}
            </Text>
          </View>
        </View>

        <View style={styles.billSection}>
          <Text style={styles.sectionTitle}>Billing Details</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Consultation Fee</Text>
            <Text style={styles.billValue}>Rs. {payment.consultationFee}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Lab Test Fee</Text>
            <Text style={styles.billValue}>Rs. {payment.labTestFee}</Text>
          </View>
          <View style={[styles.billRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>Rs. {payment.totalAmount}</Text>
          </View>
        </View>

        <View style={styles.methodSection}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodItem,
                selectedMethod === method.id && styles.methodItemActive
              ]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <View style={styles.methodLeft}>
                <Ionicons 
                  name={method.icon} 
                  size={22} 
                  color={selectedMethod === method.id ? '#4F46E5' : '#6B7280'} 
                />
                <Text style={[
                  styles.methodLabel,
                  selectedMethod === method.id && styles.methodLabelActive
                ]}>
                  {method.label}
                </Text>
              </View>
              {selectedMethod === method.id && (
                <Ionicons name="checkmark-circle" size={22} color="#4F46E5" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <CustomButton 
          title="Proceed to Payment" 
          onPress={handleConfirm}
          style={styles.payBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#1F2937' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  doctorCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  doctorAvatar: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center', marginRight: 16, overflow: 'hidden',
  },
  avatarImg: { width: 60, height: 60 },
  doctorInfo: { flex: 1 },
  doctorName: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  doctorSpec: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  apptTime: { fontSize: 12, color: '#4F46E5', fontWeight: '600', marginTop: 4 },
  billSection: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 16 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  billLabel: { fontSize: 14, color: '#6B7280' },
  billValue: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12, marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: '800', color: '#1F2937' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#4F46E5' },
  methodSection: { marginBottom: 24 },
  methodItem: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  methodItemActive: { borderColor: '#4F46E5', backgroundColor: '#F5F7FF' },
  methodLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  methodLabel: { fontSize: 15, color: '#4B5563', fontWeight: '500' },
  methodLabelActive: { color: '#4F46E5', fontWeight: '700' },
  payBtn: { marginTop: 10 },
});

export default PaymentSummaryScreen;
