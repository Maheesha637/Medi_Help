import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import CustomButton from '../../components/CustomButton';
import LoadingSpinner from '../../components/LoadingSpinner';

const statusColors = {
  Active: { bg: '#D1FAE5', text: '#059669', icon: 'checkmark-circle' },
  Expired: { bg: '#FEE2E2', text: '#DC2626', icon: 'close-circle' },
  Dispensed: { bg: '#DBEAFE', text: '#2563EB', icon: 'bag-check' },
};

const PrescriptionDetailScreen = ({ route, navigation }) => {
  const { prescriptionId } = route.params;
  const { user } = useAuth();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescription();
  }, []);

  const fetchPrescription = async () => {
    try {
      const response = await axiosInstance.get(`/prescriptions/${prescriptionId}`);
      setPrescription(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load prescription');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Prescription', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await axiosInstance.delete(`/prescriptions/${prescriptionId}`);
            Alert.alert('Success', 'Prescription deleted');
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to delete');
          }
        },
      },
    ]);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  if (loading) return <LoadingSpinner message="Loading prescription..." />;
  if (!prescription) return null;

  const colors = statusColors[prescription.status] || statusColors.Active;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Header */}
        <View style={[styles.statusCard, { backgroundColor: colors.bg }]}>
          <Ionicons name={colors.icon} size={28} color={colors.text} />
          <Text style={[styles.statusText, { color: colors.text }]}>{prescription.status}</Text>
        </View>

        {/* Doctor & Patient */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prescription Info</Text>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={16} color="#4F46E5" />
            <Text style={styles.infoLabel}>Doctor:</Text>
            <Text style={styles.infoValue}>Dr. {prescription.doctorId?.name || 'Unknown'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color="#4F46E5" />
            <Text style={styles.infoLabel}>Patient:</Text>
            <Text style={styles.infoValue}>{prescription.patientId?.name || 'Unknown'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={16} color="#4F46E5" />
            <Text style={styles.infoLabel}>Issued:</Text>
            <Text style={styles.infoValue}>{formatDate(prescription.issueDate)}</Text>
          </View>
          {prescription.expiryDate && (
            <View style={styles.infoRow}>
              <Ionicons name="timer" size={16} color="#EF4444" />
              <Text style={styles.infoLabel}>Expires:</Text>
              <Text style={styles.infoValue}>{formatDate(prescription.expiryDate)}</Text>
            </View>
          )}
        </View>

        {/* Medications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Medications ({prescription.medications?.length || 0})
          </Text>
          {prescription.medications?.map((med, index) => (
            <View key={index} style={styles.medCard}>
              <View style={styles.medHeader}>
                <View style={styles.medNumberBadge}>
                  <Text style={styles.medNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.medName}>{med.name}</Text>
              </View>
              <View style={styles.medDetails}>
                {med.dosage ? (
                  <View style={styles.medDetailRow}>
                    <Text style={styles.medDetailLabel}>Dosage</Text>
                    <Text style={styles.medDetailValue}>{med.dosage}</Text>
                  </View>
                ) : null}
                {med.frequency ? (
                  <View style={styles.medDetailRow}>
                    <Text style={styles.medDetailLabel}>Frequency</Text>
                    <Text style={styles.medDetailValue}>{med.frequency}</Text>
                  </View>
                ) : null}
                {med.duration ? (
                  <View style={styles.medDetailRow}>
                    <Text style={styles.medDetailLabel}>Duration</Text>
                    <Text style={styles.medDetailValue}>{med.duration}</Text>
                  </View>
                ) : null}
                {med.instructions ? (
                  <View style={styles.medDetailRow}>
                    <Text style={styles.medDetailLabel}>Instructions</Text>
                    <Text style={styles.medDetailValue}>{med.instructions}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          ))}
        </View>

        {/* Notes */}
        {prescription.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{prescription.notes}</Text>
          </View>
        ) : null}

        {/* Prescription Image */}
        {prescription.prescriptionImage ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scanned Prescription</Text>
            <Image
              source={{ uri: prescription.prescriptionImage }}
              style={styles.prescriptionImage}
              resizeMode="contain"
            />
          </View>
        ) : null}

        {/* Actions */}
        {(user?.role === 'doctor' || user?.role === 'admin') && (
          <View style={styles.actions}>
            <CustomButton title="Delete Prescription" onPress={handleDelete} variant="danger" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { padding: 16, paddingBottom: 30 },
  statusCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 16, borderRadius: 14, marginBottom: 12, gap: 8,
  },
  statusText: { fontSize: 18, fontWeight: '800', letterSpacing: 1 },
  section: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 14 },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10,
  },
  infoLabel: { fontSize: 13, color: '#6B7280', fontWeight: '500', width: 70 },
  infoValue: { fontSize: 14, color: '#1F2937', fontWeight: '600', flex: 1 },
  medCard: {
    backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  medHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  medNumberBadge: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: '#4F46E5',
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  medNumberText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  medName: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  medDetails: { marginLeft: 36 },
  medDetailRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6,
  },
  medDetailLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  medDetailValue: { fontSize: 13, color: '#374151', fontWeight: '600' },
  notesText: { fontSize: 14, color: '#374151', lineHeight: 22 },
  prescriptionImage: {
    width: '100%', height: 300, borderRadius: 12, backgroundColor: '#F3F4F6',
  },
  actions: { marginTop: 4 },
});

export default PrescriptionDetailScreen;
