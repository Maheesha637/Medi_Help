import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import CustomButton from '../../components/CustomButton';
import LoadingSpinner from '../../components/LoadingSpinner';

const statusColors = {
  Pending: { bg: '#FEF3C7', text: '#D97706' },
  Confirmed: { bg: '#D1FAE5', text: '#059669' },
  Completed: { bg: '#DBEAFE', text: '#2563EB' },
  Cancelled: { bg: '#FEE2E2', text: '#DC2626' },
};

const AppointmentDetailScreen = ({ route, navigation }) => {
  const { appointmentId } = route.params;
  const { user } = useAuth();
  const [payment, setPayment] = useState(null);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointment();
    fetchPayment();
  }, []);

  const fetchAppointment = async () => {
    try {
      const response = await axiosInstance.get(`/appointments/${appointmentId}`);
      setAppointment(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load appointment details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const fetchPayment = async () => {
    try {
      const response = await axiosInstance.get(`/payments/appointment/${appointmentId}`);
      setPayment(response.data);
    } catch (error) {
      console.error('Error fetching payment:', error);
    }
  };

  const handleMarkAsPaid = async () => {
    setUpdatingPayment(true);
    try {
      await axiosInstance.put(`/payments/${payment._id}/mark-paid`);
      Alert.alert('Success', 'Payment marked as paid');
      fetchPayment();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark payment as paid');
    } finally {
      setUpdatingPayment(false);
    }
  };

  const handleCancel = () => {
    Alert.alert('Cancel Appointment', 'Are you sure you want to cancel?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await axiosInstance.delete(`/appointments/${appointmentId}`);
            Alert.alert('Success', 'Appointment cancelled');
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to cancel');
          }
        },
      },
    ]);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  if (loading) return <LoadingSpinner message="Loading appointment..." />;
  if (!appointment) return null;

  const colors = statusColors[appointment.status] || statusColors.Pending;
  const isDoctor = user?.role === 'doctor';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Header */}
        <View style={[styles.statusHeader, { backgroundColor: colors.bg }]}>
          <Text style={[styles.statusTitle, { color: colors.text }]}>{appointment.status}</Text>
        </View>

        {/* Doctor Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isDoctor ? 'Patient' : 'Doctor'}</Text>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={18} color="#4F46E5" />
            <Text style={styles.infoText}>
              {isDoctor ? appointment.patientId?.name : `Dr. ${appointment.doctorId?.name}`}
            </Text>
          </View>
          {!isDoctor && (
            <View style={styles.infoRow}>
              <Ionicons name="medical" size={18} color="#4F46E5" />
              <Text style={styles.infoText}>{appointment.doctorId?.specialization || ''}</Text>
            </View>
          )}
        </View>

        {/* Appointment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={18} color="#4F46E5" />
            <Text style={styles.infoText}>{formatDate(appointment.appointmentDate)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={18} color="#4F46E5" />
            <Text style={styles.infoText}>{appointment.appointmentTime}</Text>
          </View>
          {appointment.reason ? (
            <View style={styles.infoRow}>
              <Ionicons name="document-text" size={18} color="#4F46E5" />
              <Text style={styles.infoText}>{appointment.reason}</Text>
            </View>
          ) : null}
        </View>

        {/* Payment Info Section */}
        {payment && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Status</Text>
            <View style={styles.infoRow}>
              <Ionicons name="cash" size={18} color={payment.status === 'Paid' ? '#10B981' : '#EF4444'} />
              <Text style={styles.infoText}>Method: {payment.paymentMethod}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons 
                name={payment.status === 'Paid' ? "checkmark-circle" : "alert-circle"} 
                size={18} 
                color={payment.status === 'Paid' ? '#10B981' : '#EF4444'} 
              />
              <Text style={[styles.infoText, { color: payment.status === 'Paid' ? '#10B981' : '#EF4444', fontWeight: '700' }]}>
                {payment.status}
              </Text>
            </View>
            
            {/* Mark as Paid for Doctors */}
            {isDoctor && payment.paymentMethod === 'Cash' && payment.status === 'Unpaid' && (
              <CustomButton
                title="Mark as Paid"
                onPress={handleMarkAsPaid}
                loading={updatingPayment}
                style={{ marginTop: 10 }}
              />
            )}
            
            {payment.paymentMethod === 'Cash' && payment.status === 'Paid' && (
              <View style={styles.paidBadge}>
                <Ionicons name="checkmark-done-circle" size={20} color="#FFFFFF" />
                <Text style={styles.paidBadgeText}>Cash Paid</Text>
              </View>
            )}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {appointment.status === 'Accepted' && !isDoctor && (
            <CustomButton
              title="Cancel Appointment"
              onPress={handleCancel}
              variant="danger"
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { padding: 16, paddingBottom: 30 },
  statusHeader: {
    alignItems: 'center', padding: 16, borderRadius: 14, marginBottom: 12,
  },
  statusTitle: { fontSize: 18, fontWeight: '800', letterSpacing: 1 },
  section: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20,
    marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12,
  },
  infoText: { fontSize: 15, color: '#374151', flex: 1 },
  notesText: { fontSize: 14, color: '#374151', lineHeight: 22 },
  actions: { marginTop: 4 },
  paidBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#10B981', paddingVertical: 8, borderRadius: 8,
    marginTop: 10, gap: 6,
  },
  paidBadgeText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});

export default AppointmentDetailScreen;
