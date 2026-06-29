import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axiosInstance from '../../api/axiosInstance';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

const CardPaymentScreen = ({ route, navigation }) => {
  const { payment } = route.params;
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const matched = cleaned.match(/.{1,4}/g);
    return matched ? matched.join(' ') : cleaned;
  };

  const handlePayment = async () => {
    if (!cardNumber || !cardHolder || !expiry || !cvv) {
      Alert.alert('Incomplete Form', 'Please fill in all card details.');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.put(`/payments/${payment._id}/pay`, {
        paymentMethod: 'Card'
      });
      Alert.alert('Success', 'Payment confirmed successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('PaymentList') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Card Details</Text>
            <Text style={styles.subtitle}>Enter your credit or debit card info</Text>
          </View>

          <View style={styles.cardPreview}>
            <View style={styles.chip} />
            <Text style={styles.cardNumberPreview}>{cardNumber || 'XXXX XXXX XXXX XXXX'}</Text>
            <View style={styles.cardBottom}>
              <View>
                <Text style={styles.cardLabel}>CARD HOLDER</Text>
                <Text style={styles.cardValue}>{cardHolder || 'FULL NAME'}</Text>
              </View>
              <View>
                <Text style={styles.cardLabel}>EXPIRES</Text>
                <Text style={styles.cardValue}>{expiry || 'MM/YY'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.form}>
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
              placeholder="JOHN DOE"
              autoCapitalize="characters"
              icon="person-outline"
            />
            <View style={styles.row}>
              <View style={styles.half}>
                <CustomInput
                  label="Expiry Date"
                  value={expiry}
                  onChangeText={setExpiry}
                  placeholder="MM/YY"
                  keyboardType="numeric"
                  maxLength={5}
                  icon="calendar-outline"
                />
              </View>
              <View style={styles.half}>
                <CustomInput
                  label="CVV"
                  value={cvv}
                  onChangeText={setCvv}
                  placeholder="123"
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry={true}
                  icon="lock-closed-outline"
                />
              </View>
            </View>

            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>Total Amount Due:</Text>
              <Text style={styles.totalValue}>Rs. {payment.totalAmount}</Text>
            </View>

            <CustomButton
              title={`Pay Now (Rs. ${payment.totalAmount})`}
              onPress={handlePayment}
              loading={loading}
              style={styles.payBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  scrollContent: { padding: 24 },
  header: { marginBottom: 30 },
  title: { fontSize: 24, fontWeight: '800', color: '#1F2937' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  cardPreview: {
    backgroundColor: '#1F2937', height: 200, borderRadius: 20, padding: 24,
    justifyContent: 'space-between', marginBottom: 30,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2, shadowRadius: 15, elevation: 10,
  },
  chip: { width: 45, height: 35, backgroundColor: '#FCD34D', borderRadius: 6, opacity: 0.8 },
  cardNumberPreview: { color: '#FFFFFF', fontSize: 20, letterSpacing: 2, fontWeight: '700', marginTop: 10 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  cardLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700' },
  cardValue: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginTop: 2 },
  form: { gap: 16 },
  row: { flexDirection: 'row', gap: 16 },
  half: { flex: 1 },
  totalBox: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, marginTop: 10
  },
  totalLabel: { fontSize: 14, color: '#6B7280' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#4F46E5' },
  payBtn: { marginTop: 10 },
});

export default CardPaymentScreen;
