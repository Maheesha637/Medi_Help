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

const MedicalRecordListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecords = async () => {
    try {
      const response = await axiosInstance.get('/medical-records/my');
      setRecords(response.data);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRecords();
    }, [])
  );

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const renderRecord = ({ item, index }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('MedicalRecordDetail', { recordId: item._id })}
      activeOpacity={0.7}
    >
      {/* Timeline connector */}
      <View style={styles.timeline}>
        <View style={styles.timelineDot} />
        {index < records.length - 1 && <View style={styles.timelineLine} />}
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.diagnosis}>{item.diagnosis}</Text>
          <Text style={styles.date}>{formatDate(item.visitDate)}</Text>
        </View>

        <View style={styles.doctorRow}>
          <Ionicons name={user?.role === 'doctor' ? "person-outline" : "medical-outline"} size={14} color="#6B7280" />
          <Text style={styles.doctorText}>
            {user?.role === 'doctor' 
              ? (item.patientId?.name || 'Unknown Patient')
              : `Dr. ${item.doctorId?.name || 'Unknown'}`
            }
          </Text>
          {user?.role !== 'doctor' && (
            <Text style={styles.specText}>{item.doctorId?.specialization || ''}</Text>
          )}
        </View>

        {/* Vitals Quick View */}
        <View style={styles.vitalsRow}>
          {item.bloodPressure ? (
            <View style={styles.vitalChip}>
              <Ionicons name="heart-outline" size={12} color="#EF4444" />
              <Text style={styles.vitalText}>{item.bloodPressure}</Text>
            </View>
          ) : null}
          {item.temperature ? (
            <View style={styles.vitalChip}>
              <Ionicons name="thermometer-outline" size={12} color="#F59E0B" />
              <Text style={styles.vitalText}>{item.temperature}</Text>
            </View>
          ) : null}
          {item.attachments?.length > 0 ? (
            <View style={styles.vitalChip}>
              <Ionicons name="attach" size={12} color="#4F46E5" />
              <Text style={styles.vitalText}>{item.attachments.length} files</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) return <LoadingSpinner message="Loading medical records..." />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={records}
        keyExtractor={(item) => item._id}
        renderItem={renderRecord}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRecords(); }} colors={['#4F46E5']} />
        }
        ListHeaderComponent={
          user?.role === 'doctor' ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddMedicalRecord')}
            >
              <Ionicons name="add-circle" size={22} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Medical Record</Text>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyText}>No medical records yet</Text>
            <Text style={styles.emptySubtext}>Your records will appear here</Text>
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
    flexDirection: 'row', marginBottom: 4,
  },
  timeline: {
    width: 30, alignItems: 'center',
  },
  timelineDot: {
    width: 14, height: 14, borderRadius: 7, backgroundColor: '#4F46E5',
    borderWidth: 3, borderColor: '#EEF2FF', marginTop: 18,
  },
  timelineLine: {
    width: 2, flex: 1, backgroundColor: '#E5E7EB', marginTop: 4,
  },
  cardContent: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16,
    marginLeft: 8, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 8,
  },
  diagnosis: { fontSize: 16, fontWeight: '700', color: '#1F2937', flex: 1, marginRight: 8 },
  date: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  doctorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10,
  },
  doctorText: { fontSize: 13, color: '#374151', fontWeight: '600' },
  specText: { fontSize: 12, color: '#6B7280' },
  vitalsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  vitalChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F9FAFB', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6, borderWidth: 1, borderColor: '#F3F4F6',
  },
  vitalText: { fontSize: 11, color: '#374151', fontWeight: '500' },
  emptyContainer: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, color: '#9CA3AF', marginTop: 12, fontWeight: '600' },
  emptySubtext: { fontSize: 13, color: '#D1D5DB', marginTop: 4 },
});

export default MedicalRecordListScreen;
