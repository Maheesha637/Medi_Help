import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import CustomButton from '../../components/CustomButton';
import LoadingSpinner from '../../components/LoadingSpinner';

const MedicalRecordDetailScreen = ({ route, navigation }) => {
  const { recordId } = route.params;
  const { user } = useAuth();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecord();
  }, []);

  const fetchRecord = async () => {
    try {
      const response = await axiosInstance.get(`/medical-records/${recordId}`);
      setRecord(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load medical record');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };



  const handleDelete = () => {
    Alert.alert('Delete Record', 'Are you sure you want to delete this record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await axiosInstance.delete(`/medical-records/${recordId}`);
            Alert.alert('Success', 'Record deleted');
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

  if (loading) return <LoadingSpinner message="Loading record..." />;
  if (!record) return null;

  const isOwner = user?.role === 'doctor' && record.doctorId?.userId === user._id;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Actions for Owners */}
        {isOwner && (
          <View style={styles.ownerActions}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.editBtn]} 
              onPress={() => navigation.navigate('EditMedicalRecord', { record })}
            >
              <Ionicons name="create-outline" size={18} color="#4F46E5" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.deleteBtn]} 
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerIcon}>
            <Ionicons name="document-text" size={30} color="#4F46E5" />
          </View>
          <Text style={styles.diagnosis}>{record.diagnosis}</Text>
          <Text style={styles.dateText}>Visit: {formatDate(record.visitDate)}</Text>
        </View>

        {/* Patient/Doctor Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{user?.role === 'doctor' ? 'Patient' : 'Doctor'}</Text>
          {user?.role === 'doctor' ? (
            <>
              <View style={styles.infoRow}>
                <Ionicons name="person" size={16} color="#4F46E5" />
                <Text style={styles.infoText}>{record.patientId?.name || 'Unknown'}</Text>
              </View>
              {record.patientId?.email && (
                <View style={styles.infoRow}>
                  <Ionicons name="mail" size={16} color="#4F46E5" />
                  <Text style={styles.infoText}>{record.patientId.email}</Text>
                </View>
              )}
              {record.patientId?.phone && (
                <View style={styles.infoRow}>
                  <Ionicons name="call" size={16} color="#4F46E5" />
                  <Text style={styles.infoText}>{record.patientId.phone}</Text>
                </View>
              )}
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <Ionicons name="person" size={16} color="#4F46E5" />
                <Text style={styles.infoText}>Dr. {record.doctorId?.name || 'Unknown'}</Text>
              </View>
              {record.doctorId?.specialization && (
                <View style={styles.infoRow}>
                  <Ionicons name="medical" size={16} color="#4F46E5" />
                  <Text style={styles.infoText}>{record.doctorId.specialization}</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Vitals */}
        {(record.bloodPressure || record.temperature || record.weight || record.height) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vitals</Text>
            <View style={styles.vitalsGrid}>
              {record.bloodPressure && (
                <View style={styles.vitalCard}>
                  <Ionicons name="heart" size={20} color="#EF4444" />
                  <Text style={styles.vitalValue}>{record.bloodPressure}</Text>
                  <Text style={styles.vitalLabel}>Blood Pressure</Text>
                </View>
              )}
              {record.temperature && (
                <View style={styles.vitalCard}>
                  <Ionicons name="thermometer" size={20} color="#F59E0B" />
                  <Text style={styles.vitalValue}>{record.temperature}</Text>
                  <Text style={styles.vitalLabel}>Temperature</Text>
                </View>
              )}
              {record.weight && (
                <View style={styles.vitalCard}>
                  <Ionicons name="fitness" size={20} color="#10B981" />
                  <Text style={styles.vitalValue}>{record.weight} kg</Text>
                  <Text style={styles.vitalLabel}>Weight</Text>
                </View>
              )}
              {record.height && (
                <View style={styles.vitalCard}>
                  <Ionicons name="resize" size={20} color="#6366F1" />
                  <Text style={styles.vitalValue}>{record.height} cm</Text>
                  <Text style={styles.vitalLabel}>Height</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Symptoms */}
        {record.symptoms?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Symptoms</Text>
            <View style={styles.chipContainer}>
              {record.symptoms.map((symptom, i) => (
                <View key={i} style={styles.symptomChip}>
                  <Text style={styles.symptomText}>{symptom}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Treatment */}
        {record.treatment && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Treatment</Text>
            <Text style={styles.bodyText}>{record.treatment}</Text>
          </View>
        )}

        {/* Lab Results */}
        {record.labResults && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lab Results</Text>
            <Text style={styles.bodyText}>{record.labResults}</Text>
          </View>
        )}

        {/* Follow Up */}
        {record.followUpDate && (
          <View style={styles.section}>
            <View style={styles.followUpRow}>
              <Ionicons name="calendar" size={18} color="#4F46E5" />
              <Text style={styles.followUpText}>Follow-up: {formatDate(record.followUpDate)}</Text>
            </View>
          </View>
        )}

        {/* Attachments */}
        {record.attachments?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Attachments ({record.attachments.length})</Text>
            {record.attachments.map((file, i) => (
              <View key={i} style={styles.attachmentRow}>
                <Ionicons name="document-attach" size={18} color="#4F46E5" />
                <Text style={styles.attachmentText} numberOfLines={1}>
                  {file.split('/').pop()}
                </Text>
              </View>
            ))}
          </View>
        )}


      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { padding: 16, paddingBottom: 30 },
  ownerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginBottom: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
  },
  editBtn: {
    borderColor: '#E0E7FF',
    backgroundColor: '#EEF2FF',
  },
  deleteBtn: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  editBtnText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  deleteBtnText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  headerCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, alignItems: 'center',
    marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  headerIcon: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  diagnosis: { fontSize: 20, fontWeight: '700', color: '#1F2937', textAlign: 'center' },
  dateText: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  section: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  infoText: { fontSize: 15, color: '#374151' },
  vitalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  vitalCard: {
    width: '47%', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6',
  },
  vitalValue: { fontSize: 18, fontWeight: '800', color: '#1F2937', marginTop: 6 },
  vitalLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  symptomChip: {
    backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  symptomText: { fontSize: 13, color: '#D97706', fontWeight: '600' },
  bodyText: { fontSize: 14, color: '#374151', lineHeight: 22 },
  followUpRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  followUpText: { fontSize: 15, color: '#4F46E5', fontWeight: '600' },
  attachmentRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  attachmentText: { fontSize: 14, color: '#374151', flex: 1 },
  actions: { marginTop: 4 },
});

export default MedicalRecordDetailScreen;
