import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity,
  Platform, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../../api/axiosInstance';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const emptyMedication = { name: '', dosage: '', frequency: '', duration: '', instructions: '' };

const AddPrescriptionScreen = ({ route, navigation }) => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [patientId, setPatientId] = useState(route.params?.patientId || '');
  const [doctorId, setDoctorId] = useState(route.params?.doctorId || '');
  const [medications, setMedications] = useState([{ ...emptyMedication }]);
  const [notes, setNotes] = useState('');
  const [issueDate, setIssueDate] = useState(new Date());
  const [expiryDate, setExpiryDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const [showIssuePicker, setShowIssuePicker] = useState(false);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const [doctorRes, patientRes] = await Promise.all([
        axiosInstance.get('/doctors'),
        axiosInstance.get('/auth/patients')
      ]);
      setDoctors(doctorRes.data);
      setPatients(patientRes.data);

      if (user?.role === 'doctor') {
        const myProfile = await axiosInstance.get('/doctors/me');
        setDoctorId(myProfile.data._id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      try {
        const userRes = await axiosInstance.get('/auth/users');
        setPatients(userRes.data.filter(u => u.role === 'patient'));
      } catch (e) {}
    } finally {
      setLoadingData(false);
    }
  };

  const addMedication = () => {
    setMedications([...medications, { ...emptyMedication }]);
  };

  const removeMedication = (index) => {
    if (medications.length === 1) {
      Alert.alert('Error', 'At least one medication is required');
      return;
    }
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index, field, value) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const validate = () => {
    const newErrors = {};
    if (!patientId.trim()) newErrors.patient = 'Patient ID is required';
    if (!doctorId) newErrors.doctor = 'Please select a doctor';
    const hasValidMed = medications.some((m) => m.name.trim());
    if (!hasValidMed) newErrors.medications = 'At least one medication with a name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const validMeds = medications.filter((m) => m.name.trim()).map((m) => ({
      name: m.name.trim(),
      dosage: m.dosage.trim(),
      frequency: m.frequency.trim(),
      duration: m.duration.trim(),
      instructions: m.instructions.trim(),
    }));

    setLoading(true);
    try {
      await axiosInstance.post('/prescriptions', {
        patientId: patientId.trim(),
        doctorId,
        medications: validMeds,
        notes: notes.trim(),
        issueDate: issueDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
      });
      Alert.alert('Success', 'Prescription created successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create prescription');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) return <LoadingSpinner message="Loading..." />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.formCard}>
            {user?.role !== 'doctor' && (
              <>
                <Text style={styles.sectionTitle}>Patient & Doctor</Text>
                
                <Text style={styles.fieldLabel}>Select Patient *</Text>
                {errors.patient && <Text style={styles.errorText}>{errors.patient}</Text>}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  {patients.map((p) => (
                    <TouchableOpacity
                      key={p._id}
                      style={[styles.chip, patientId === p._id && styles.chipActive]}
                      onPress={() => setPatientId(p._id)}
                    >
                      <Text style={[styles.chipText, patientId === p._id && styles.chipTextActive]}>
                        {p.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.fieldLabel}>Select Doctor *</Text>
                {errors.doctor && <Text style={styles.errorText}>{errors.doctor}</Text>}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  {doctors.map((doc) => (
                    <TouchableOpacity
                      key={doc._id}
                      style={[styles.chip, doctorId === doc._id && styles.chipActive]}
                      onPress={() => setDoctorId(doc._id)}
                    >
                      <Text style={[styles.chipText, doctorId === doc._id && styles.chipTextActive]}>
                        Dr. {doc.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {user?.role === 'doctor' && (
              <>
                <Text style={styles.sectionTitle}>Select Patient</Text>
                {errors.patient && <Text style={styles.errorText}>{errors.patient}</Text>}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  {patients.map((p) => (
                    <TouchableOpacity
                      key={p._id}
                      style={[styles.chip, patientId === p._id && styles.chipActive]}
                      onPress={() => setPatientId(p._id)}
                    >
                      <Text style={[styles.chipText, patientId === p._id && styles.chipTextActive]}>
                        {p.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {/* Medications */}
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Medications</Text>
            {errors.medications && <Text style={styles.errorText}>{errors.medications}</Text>}

            {medications.map((med, index) => (
              <View key={index} style={styles.medCard}>
                <View style={styles.medHeader}>
                  <Text style={styles.medNumber}>Medication {index + 1}</Text>
                  <TouchableOpacity onPress={() => removeMedication(index)}>
                    <Ionicons name="close-circle" size={22} color="#EF4444" />
                  </TouchableOpacity>
                </View>
                <CustomInput label="Name *" value={med.name} onChangeText={(v) => updateMedication(index, 'name', v)} placeholder="e.g. Amoxicillin" />
                <View style={styles.medRow}>
                  <View style={{ flex: 1 }}>
                    <CustomInput label="Dosage" value={med.dosage} onChangeText={(v) => updateMedication(index, 'dosage', v)} placeholder="e.g. 500mg" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <CustomInput label="Frequency" value={med.frequency} onChangeText={(v) => updateMedication(index, 'frequency', v)} placeholder="e.g. Twice daily" />
                  </View>
                </View>
                <View style={styles.medRow}>
                  <View style={{ flex: 1 }}>
                    <CustomInput label="Duration" value={med.duration} onChangeText={(v) => updateMedication(index, 'duration', v)} placeholder="e.g. 7 days" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <CustomInput label="Instructions" value={med.instructions} onChangeText={(v) => updateMedication(index, 'instructions', v)} placeholder="e.g. After meals" />
                  </View>
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.addMedButton} onPress={addMedication}>
              <Ionicons name="add-circle-outline" size={20} color="#4F46E5" />
              <Text style={styles.addMedText}>Add Another Medication</Text>
            </TouchableOpacity>

            {/* Dates */}
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Dates</Text>
            <Text style={styles.fieldLabel}>Issue Date</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowIssuePicker(true)}>
              <Ionicons name="calendar-outline" size={18} color="#4F46E5" />
              <Text style={styles.dateButtonText}>{issueDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showIssuePicker && (
              <DateTimePicker value={issueDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(e, d) => { setShowIssuePicker(Platform.OS === 'ios'); if (d) setIssueDate(d); }} />
            )}

            <Text style={styles.fieldLabel}>Expiry Date</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowExpiryPicker(true)}>
              <Ionicons name="calendar-outline" size={18} color="#4F46E5" />
              <Text style={styles.dateButtonText}>{expiryDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showExpiryPicker && (
              <DateTimePicker value={expiryDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(e, d) => { setShowExpiryPicker(Platform.OS === 'ios'); if (d) setExpiryDate(d); }} />
            )}

            {/* Notes */}
            <CustomInput label="Notes" value={notes} onChangeText={setNotes} placeholder="Additional notes" multiline numberOfLines={2} icon="create-outline" style={{ marginTop: 12 }} />

            <CustomButton title="Create Prescription" onPress={handleSubmit} loading={loading} style={{ marginTop: 12 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { padding: 16, paddingBottom: 30 },
  formCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 8 },
  errorText: { color: '#EF4444', fontSize: 12, marginBottom: 4 },
  horizontalScroll: { marginBottom: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#E5E7EB', marginRight: 8, backgroundColor: '#F9FAFB',
  },
  chipActive: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  chipTextActive: { color: '#4F46E5' },
  medCard: {
    backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  medHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
  },
  medNumber: { fontSize: 14, fontWeight: '700', color: '#4F46E5' },
  medRow: { flexDirection: 'row', gap: 10 },
  addMedButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, borderColor: '#4F46E5',
    borderStyle: 'dashed', gap: 6,
  },
  addMedText: { fontSize: 14, color: '#4F46E5', fontWeight: '600' },
  dateButton: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14,
    borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB',
    gap: 10, marginBottom: 12,
  },
  dateButtonText: { fontSize: 15, color: '#374151', fontWeight: '500' },
});

export default AddPrescriptionScreen;
