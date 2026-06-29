import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../../api/axiosInstance';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

const BookingPaymentScreen = ({ route, navigation }) => {
  const { appointmentData, doctor } = route.params;
  const [paymentMethod, setPaymentMethod] = useState('Card'); // Card or Cash
  const [loading, setLoading] = useState(false);

  // Card details state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const matched = cleaned.match(/.{1,4}/g);
    return matched ? matched.join(' ') : cleaned;
  };

  const handlePaymentAndBooking = async () => {
    if (paymentMethod === 'Card') {
      const cleanedCard = cardNumber.replace(/\s/g, '');
      if (cleanedCard.length !== 16 || !cardHolder || !expiry || cvv.length < 3) {
        Alert.alert('Error', 'Please enter valid card details (16-digit card number required)');
        return;
      }
    }

    setLoading(true);
    try {
      // 1. Create Appointment first (we need ID for payment)
      const apptRes = await axiosInstance.post('/appointments', {
        ...appointmentData,
        status: 'Accepted' // Automatically accepted as per previous instruction
      });

      const appointmentId = apptRes.data._id;

      // 2. Create Payment record
      await axiosInstance.post('/payments/create', {
        appointmentId,
        doctorId: doctor._id,
        consultationFee: doctor.consultationFee,
        paymentMethod
      });

      const successMsg = paymentMethod === 'Card' 
        ? 'Payment successful! Your appointment has been confirmed.'
        : 'Appointment confirmed! Please bring cash payment to the clinic.';

      Alert.alert('Success', successMsg, [
        { text: 'OK', onPress: () => navigation.navigate('Appointments') }
      ]);
    } catch (error) {
      console.error('Payment/Booking error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to complete booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Review & Pay</Text>
            <Text style={styles.headerSubtitle}>Complete payment to confirm your booking</Text>
          </View>

          {/* Appointment Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.doctorInfo}>
              <View style={styles.avatar}>
                {doctor.profileImage ? (
                  <Image source={{ uri: doctor.profileImage }} style={styles.avatarImg} />
                ) : (
                  <Ionicons name="person" size={24} color="#4F46E5" />
                )}
              </View>
              <View>
                <Text style={styles.doctorName}>Dr. {doctor.name}</Text>
                <Text style={styles.doctorSpec}>{doctor.specialization}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>
                {new Date(appointmentData.appointmentDate).toLocaleDateString('en-US', { 
                  month: 'long', day: 'numeric', year: 'numeric' 
                })}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{appointmentData.appointmentTime}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Total Amount Due</Text>
              <Text style={styles.feeValue}>Rs. {doctor.consultationFee}</Text>
            </View>
          </View>

          {/* Payment Method Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Payment Method</Text>
            <View style={styles.methodGrid}>
              <TouchableOpacity 
                style={[styles.methodBtn, paymentMethod === 'Card' && styles.methodBtnActive]}
                onPress={() => setPaymentMethod('Card')}
              >
                <Ionicons name="card-outline" size={24} color={paymentMethod === 'Card' ? '#4F46E5' : '#6B7280'} />
                <Text style={[styles.methodText, paymentMethod === 'Card' && styles.methodTextActive]}>Card</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.methodBtn, paymentMethod === 'Cash' && styles.methodBtnActive]}
                onPress={() => setPaymentMethod('Cash')}
              >
                <Ionicons name="cash-outline" size={24} color={paymentMethod === 'Cash' ? '#4F46E5' : '#6B7280'} />
                <Text style={[styles.methodText, paymentMethod === 'Cash' && styles.methodTextActive]}>Cash</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Conditional Payment UI */}
          {paymentMethod === 'Card' ? (
            <View style={styles.cardForm}>
              <CustomInput
                label="Card Number"
                value={cardNumber}
                onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                placeholder="1234 5678 9012 3456"
                keyboardType="numeric"
                maxLength={19}
                icon="card-outline"
              />
              <CustomInput
                label="Card Holder Name"
                value={cardHolder}
                onChangeText={setCardHolder}
                placeholder="Name on card"
                icon="person-outline"
              />
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <CustomInput
                    label="Expiry Date"
                    value={expiry}
                    onChangeText={setExpiry}
                    placeholder="MM/YY"
                    maxLength={5}
                    icon="calendar-outline"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <CustomInput
                    label="CVV"
                    value={cvv}
                    onChangeText={setCvv}
                    placeholder="123"
                    keyboardType="numeric"
                    maxLength={3}
                    secureTextEntry
                    icon="lock-closed-outline"
                  />
                </View>
              </View>
              <CustomButton 
                title={`Pay Now (Rs. ${doctor.consultationFee})`} 
                onPress={handlePaymentAndBooking} 
                loading={loading}
                style={{ marginTop: 20 }}
              />
            </View>
          ) : (
            <View style={styles.cashNotice}>
              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={24} color="#4F46E5" />
                <Text style={styles.infoText}>
                  You have selected cash payment. Please bring the exact amount to the clinic on your appointment day.
                </Text>
              </View>
              <View style={styles.totalDue}>
                <Text style={styles.totalDueLabel}>Total Amount Due:</Text>
                <Text style={styles.totalDueValue}>Rs. {doctor.consultationFee}</Text>
              </View>
              <CustomButton 
                title="Confirm & Book" 
                onPress={handlePaymentAndBooking} 
                loading={loading}
                style={{ marginTop: 20 }}
              />
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#1F2937' },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  summaryCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
  },
  doctorInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImg: { width: 50, height: 50 },
  doctorName: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  doctorSpec: { fontSize: 13, color: '#6B7280' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  detailText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feeLabel: { fontSize: 16, color: '#1F2937', fontWeight: '700' },
  feeValue: { fontSize: 20, color: '#4F46E5', fontWeight: '800' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  methodGrid: { flexDirection: 'row', gap: 12 },
  methodBtn: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 12, backgroundColor: '#FFFFFF',
    borderWidth: 2, borderColor: '#F3F4F6',
  },
  methodBtnActive: { borderColor: '#4F46E5', backgroundColor: '#F5F7FF' },
  methodText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
  methodTextActive: { color: '#4F46E5' },
  row: { flexDirection: 'row' },
  cardForm: { gap: 4 },
  cashNotice: { gap: 16 },
  infoBox: { 
    flexDirection: 'row', backgroundColor: '#EEF2FF', padding: 16, 
    borderRadius: 12, gap: 12, alignItems: 'center' 
  },
  infoText: { flex: 1, fontSize: 14, color: '#4F46E5', lineHeight: 20, fontWeight: '500' },
  totalDue: { alignItems: 'center', paddingVertical: 10 },
  totalDueLabel: { fontSize: 14, color: '#6B7280' },
  totalDueValue: { fontSize: 28, fontWeight: '800', color: '#1F2937', marginTop: 4 },
});

export default BookingPaymentScreen;
