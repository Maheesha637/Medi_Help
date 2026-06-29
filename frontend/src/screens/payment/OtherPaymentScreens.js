import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axiosInstance from '../../api/axiosInstance';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';

const PayPalPaymentScreen = ({ route, navigation }) => {
  const { payment } = route.params;
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid PayPal email address.');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.put(`/payments/${payment._id}/pay`, { paymentMethod: 'PayPal' });
      Alert.alert('Success', 'Payment confirmed successfully!', [{ text: 'OK', onPress: () => navigation.navigate('PaymentList') }]);
    } catch (error) {
      Alert.alert('Error', 'Transaction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Ionicons name="logo-paypal" size={80} color="#003087" style={styles.icon} />
        <Text style={styles.title}>PayPal Payment</Text>
        <Text style={styles.desc}>Log in to your PayPal account to complete the payment of Rs. {payment.totalAmount}.</Text>
        <CustomInput label="PayPal Email" value={email} onChangeText={setEmail} placeholder="email@example.com" keyboardType="email-address" icon="mail-outline" />
        <CustomButton title="Pay with PayPal" onPress={handlePay} loading={loading} style={styles.btn} />
      </ScrollView>
    </SafeAreaView>
  );
};

const CashPaymentScreen = ({ route, navigation }) => {
  const { payment } = route.params;
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await axiosInstance.put(`/payments/${payment._id}/pay`, { paymentMethod: 'Cash' });
      Alert.alert('Success', 'Payment confirmed successfully!', [{ text: 'OK', onPress: () => navigation.navigate('PaymentList') }]);
    } catch (error) {
      Alert.alert('Error', 'Failed to confirm.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Ionicons name="cash-outline" size={80} color="#10B981" style={styles.icon} />
        <Text style={styles.title}>Cash Payment</Text>
        <Text style={styles.desc}>Please pay the amount at the clinic reception before your appointment.</Text>
        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Total Amount Due:</Text>
          <Text style={styles.amountValue}>Rs. {payment.totalAmount}</Text>
        </View>
        <CustomButton title="Confirm Cash Payment" onPress={handleConfirm} loading={loading} style={styles.btn} />
      </View>
    </SafeAreaView>
  );
};

const InsurancePaymentScreen = ({ route, navigation }) => {
  const { payment } = route.params;
  const [provider, setProvider] = useState('');
  const [policy, setPolicy] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!provider || !policy) {
      Alert.alert('Incomplete Fields', 'Please enter provider name and policy number.');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.put(`/payments/${payment._id}/pay`, { paymentMethod: 'Insurance' });
      Alert.alert('Success', 'Payment confirmed successfully!', [{ text: 'OK', onPress: () => navigation.navigate('PaymentList') }]);
    } catch (error) {
      Alert.alert('Error', 'Failed to verify insurance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Ionicons name="shield-checkmark-outline" size={80} color="#4F46E5" style={styles.icon} />
        <Text style={styles.title}>Insurance Payment</Text>
        <Text style={styles.desc}>Enter your insurance details for direct billing to your provider.</Text>
        <CustomInput label="Insurance Provider" value={provider} onChangeText={setProvider} placeholder="e.g. Ceylinco Life" icon="business-outline" />
        <CustomInput label="Policy Number" value={policy} onChangeText={setPolicy} placeholder="POL-12345678" icon="document-outline" />
        <CustomButton title="Confirm Insurance Payment" onPress={handleConfirm} loading={loading} style={styles.btn} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { padding: 30, alignItems: 'center' },
  icon: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#1F2937', marginBottom: 10 },
  desc: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 30, lineHeight: 24 },
  btn: { width: '100%', marginTop: 20 },
  amountBox: { backgroundColor: '#F3F4F6', padding: 20, borderRadius: 12, width: '100%', alignItems: 'center', marginBottom: 20 },
  amountLabel: { fontSize: 14, color: '#6B7280' },
  amountValue: { fontSize: 24, fontWeight: '800', color: '#4F46E5', marginTop: 5 },
});

export { PayPalPaymentScreen, CashPaymentScreen, InsurancePaymentScreen };
