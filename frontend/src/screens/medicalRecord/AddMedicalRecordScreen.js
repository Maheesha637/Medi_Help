import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../../api/axiosInstance';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

const AddMedicalRecordScreen = ({ route, navigation }) => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [patientId, setPatientId] = useState(route.params?.patientId || '');
  const [doctorId, setDoctorId] = useState(route.params?.doctorId || '');
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [treatment, setTreatment] = useState('');
  const [labResults, setLabResults] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [temperature, setTemperature] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [visitDate, setVisitDate] = useState(new Date());
  const [followUpDate, setFollowUpDate] = useState(new Date());
  const [showVisitPicker, setShowVisitPicker] = useState(false);
  const [showFollowUpPicker, setShowFollowUpPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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
      // Fallback: if /users/patients fails, try getting all users
      try {
        const userRes = await axiosInstance.get('/auth/users');
        setPatients(userRes.data.filter(u => u.role === 'patient'));
      } catch (e) {}
    } finally {
      setLoadingData(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!diagnosis.trim()) newErrors.diagnosis = 'Diagnosis is required';
    if (!doctorId) newErrors.doctor = 'Please select a doctor';
    if (!patientId.trim()) newErrors.patient = 'Patient ID is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await axiosInstance.post('/medical-records', {
        patientId: patientId.trim(),
        doctorId,
        diagnosis: diagnosis.trim(),
        symptoms: symptoms ? symptoms.split(',').map((s) => s.trim()) : [],
        treatment: treatment.trim(),
        labResults: labResults.trim(),
        bloodPressure: bloodPressure.trim(),
        temperature: temperature.trim(),
        weight: weight ? Number(weight) : null,
        height: height ? Number(height) : null,
        visitDate: visitDate.toISOString(),
        followUpDate: followUpDate ? followUpDate.toISOString() : null,
      });
      Alert.alert('Success', 'Medical record created successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create record');
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

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Diagnosis & Treatment</Text>
            <CustomInput label="Diagnosis *" value={diagnosis} onChangeText={setDiagnosis} placeholder="Primary diagnosis" icon="medkit-outline" error={errors.diagnosis} />
            <CustomInput label="Symptoms (comma separated)" value={symptoms} onChangeText={setSymptoms} placeholder="e.g. Fever, Headache, Cough" icon="list-outline" />
            <CustomInput label="Treatment" value={treatment} onChangeText={setTreatment} placeholder="Treatment plan" multiline numberOfLines={2} icon="bandage-outline" />
            <CustomInput label="Lab Results" value={labResults} onChangeText={setLabResults} placeholder="Lab test results" multiline numberOfLines={2} icon="flask-outline" />

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Vitals</Text>
            <View style={styles.vitalsGrid}>
              <View style={styles.vitalHalf}>
                <CustomInput label="Blood Pressure" value={bloodPressure} onChangeText={setBloodPressure} placeholder="120/80" icon="heart-outline" />
              </View>
              <View style={styles.vitalHalf}>
                <CustomInput label="Temperature" value={temperature} onChangeText={setTemperature} placeholder="98.6°F" icon="thermometer-outline" />
              </View>
            </View>
            <View style={styles.vitalsGrid}>
              <View style={styles.vitalHalf}>
                <CustomInput label="Weight (kg)" value={weight} onChangeText={setWeight} placeholder="70" keyboardType="numeric" icon="fitness-outline" />
              </View>
              <View style={styles.vitalHalf}>
                <CustomInput label="Height (cm)" value={height} onChangeText={setHeight} placeholder="170" keyboardType="numeric" icon="resize-outline" />
              </View>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Dates</Text>
            <Text style={styles.fieldLabel}>Visit Date</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowVisitPicker(true)}>
              <Ionicons name="calendar-outline" size={18} color="#4F46E5" />
              <Text style={styles.dateButtonText}>{visitDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showVisitPicker && (
              <DateTimePicker value={visitDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(e, d) => { setShowVisitPicker(Platform.OS === 'ios'); if (d) setVisitDate(d); }} />
            )}

            <Text style={styles.fieldLabel}>Follow-up Date</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowFollowUpPicker(true)}>
              <Ionicons name="calendar-outline" size={18} color="#4F46E5" />
              <Text style={styles.dateButtonText}>{followUpDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showFollowUpPicker && (
              <DateTimePicker value={followUpDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(e, d) => { setShowFollowUpPicker(Platform.OS === 'ios'); if (d) setFollowUpDate(d); }} />
            )}

            <CustomButton title="Create Medical Record" onPress={handleSubmit} loading={loading} style={{ marginTop: 20 }} />
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
  vitalsGrid: { flexDirection: 'row', gap: 12 },
  vitalHalf: { flex: 1 },
  dateButton: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14,
    borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB',
    gap: 10, marginBottom: 12,
  },
  dateButtonText: { fontSize: 15, color: '#374151', fontWeight: '500' },
});

export default AddMedicalRecordScreen;
