import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const statusColors = {
  Active: { bg: '#D1FAE5', text: '#059669' },
  Expired: { bg: '#FEE2E2', text: '#DC2626' },
  Dispensed: { bg: '#DBEAFE', text: '#2563EB' },
};

const PrescriptionListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isDoctor = user?.role === 'doctor';

  const fetchPrescriptions = async () => {
    try {
      const response = await axiosInstance.get('/prescriptions/my');
      setPrescriptions(response.data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPrescriptions();
    }, [])
  );

  const renderPrescription = ({ item }) => {
    const colors = statusColors[item.status] || statusColors.Active;
    const medCount = item.medications?.length || 0;
    const displayName = isDoctor ? (item.patientId?.name || 'Unknown Patient') : (`Dr. ${item.doctorId?.name || 'Unknown'}`);
    const subText = isDoctor ? (item.patientId?.email || '') : (item.doctorId?.specialization || '');

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('PrescriptionDetail', { prescriptionId: item._id })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <Ionicons name={isDoctor ? "person" : "medical"} size={22} color="#4F46E5" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.doctorName}>{displayName}</Text>
            <Text style={styles.specialization}>{subText}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.statusText, { color: colors.text }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.medRow}>
            <Ionicons name="medkit-outline" size={14} color="#6B7280" />
            <Text style={styles.medText}>{medCount} medication{medCount !== 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.dateText}>
              Issued: {new Date(item.issueDate).toLocaleDateString()}
            </Text>
          </View>
          {item.expiryDate && (
            <View style={styles.dateRow}>
              <Ionicons name="timer-outline" size={14} color="#6B7280" />
              <Text style={styles.dateText}>
                Expires: {new Date(item.expiryDate).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return <LoadingSpinner message="Loading prescriptions..." />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={prescriptions}
        keyExtractor={(item) => item._id}
        renderItem={renderPrescription}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPrescriptions(); }} colors={['#4F46E5']} />
        }
        ListHeaderComponent={
          (user?.role === 'doctor' || user?.role === 'admin') ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddPrescription')}
            >
              <Ionicons name="add-circle" size={22} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Prescription</Text>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="medical-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyText}>No prescriptions yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  listContent: { padding: 16, paddingBottom: 20 },
  addButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#4F46E5', paddingVertical: 14, borderRadius: 12,
    marginBottom: 16, gap: 8,
  },
  addButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  cardInfo: { flex: 1 },
  doctorName: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  specialization: { fontSize: 12, color: '#6B7280', marginTop: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardBody: {
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', gap: 6,
  },
  medRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  medText: { fontSize: 13, color: '#374151', fontWeight: '600' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 12, color: '#6B7280' },
  emptyContainer: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, color: '#9CA3AF', marginTop: 12 },
});

export default PrescriptionListScreen;
