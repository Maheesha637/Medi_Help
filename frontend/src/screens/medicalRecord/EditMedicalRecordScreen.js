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

const EditMedicalRecordScreen = ({ route, navigation }) => {
  const { record } = route.params;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [diagnosis, setDiagnosis] = useState(record.diagnosis || '');
  const [symptoms, setSymptoms] = useState(record.symptoms?.join(', ') || '');
  const [treatment, setTreatment] = useState(record.treatment || '');
  const [labResults, setLabResults] = useState(record.labResults || '');
  const [bloodPressure, setBloodPressure] = useState(record.bloodPressure || '');
  const [temperature, setTemperature] = useState(record.temperature || '');
  const [weight, setWeight] = useState(record.weight?.toString() || '');
  const [height, setHeight] = useState(record.height?.toString() || '');
  const [visitDate, setVisitDate] = useState(new Date(record.visitDate));
  const [followUpDate, setFollowUpDate] = useState(record.followUpDate ? new Date(record.followUpDate) : new Date());
  const [showVisitPicker, setShowVisitPicker] = useState(false);
  const [showFollowUpPicker, setShowFollowUpPicker] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!diagnosis.trim()) newErrors.diagnosis = 'Diagnosis is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await axiosInstance.put(`/medical-records/${record._id}`, {
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
      Alert.alert('Success', 'Medical record updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.formCard}>
            <Text style={styles.headerTitle}>Update Medical Record</Text>
            <Text style={styles.patientInfo}>Patient: {record.patientId?.name}</Text>

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

            <CustomButton title="Update Record" onPress={handleSubmit} loading={loading} style={{ marginTop: 20 }} />
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
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1F2937', marginBottom: 4 },
  patientInfo: { fontSize: 15, color: '#4F46E5', fontWeight: '600', marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 8 },
  vitalsGrid: { flexDirection: 'row', gap: 12 },
  vitalHalf: { flex: 1 },
  dateButton: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14,
    borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB',
    gap: 10, marginBottom: 12,
  },
  dateButtonText: { fontSize: 15, color: '#374151', fontWeight: '500' },
});

export default EditMedicalRecordScreen;
