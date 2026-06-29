import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axiosInstance from '../../api/axiosInstance';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const EditDoctorScreen = ({ route, navigation }) => {
  const { doctor, useMyProfile } = route.params;
  const [name, setName] = useState(doctor.name || '');
  const [specialization, setSpecialization] = useState(doctor.specialization || '');
  const [qualification, setQualification] = useState(doctor.qualification || '');
  const [experience, setExperience] = useState(doctor.experience?.toString() || '');
  const [hospital, setHospital] = useState(doctor.hospital || '');
  const [consultationFee, setConsultationFee] = useState(doctor.consultationFee?.toString() || '');
  const [availableDays, setAvailableDays] = useState(doctor.availableDays || []);
  
  const parseTimeStr = (timeStr, defaultHour) => {
    try {
      if (!timeStr) return new Date(new Date().setHours(defaultHour, 0, 0, 0));
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return new Date(new Date().setHours(defaultHour, 0, 0, 0));
      let hours = parseInt(match[1]);
      const mins = parseInt(match[2]);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      return new Date(new Date().setHours(hours, mins, 0, 0));
    } catch {
      return new Date(new Date().setHours(defaultHour, 0, 0, 0));
    }
  };

  const initialStartTime = doctor.availableTime && doctor.availableTime.includes('-') 
    ? parseTimeStr(doctor.availableTime.split('-')[0].trim(), 9)
    : new Date(new Date().setHours(9, 0, 0, 0));

  const initialEndTime = doctor.availableTime && doctor.availableTime.includes('-') 
    ? parseTimeStr(doctor.availableTime.split('-')[1].trim(), 17)
    : new Date(new Date().setHours(17, 0, 0, 0));

  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [bio, setBio] = useState(doctor.bio || '');

  const formatTime = (date) => {
    if (!date) return '';
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours || 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  };
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const toggleDay = (day) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!specialization.trim()) newErrors.specialization = 'Specialization is required';
    if (consultationFee && isNaN(Number(consultationFee))) {
      newErrors.consultationFee = 'Must be a valid number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        specialization: specialization.trim(),
        qualification: qualification.trim(),
        experience: experience ? Number(experience) : 0,
        hospital: hospital.trim(),
        consultationFee: consultationFee ? Number(consultationFee) : 0,
        availableDays,
        availableTime: `${formatTime(startTime)} - ${formatTime(endTime)}`,
        bio: bio.trim(),
      };

      if (useMyProfile) {
        // Doctor editing their own profile — uses the doctor-accessible /me endpoint
        await axiosInstance.put('/doctors/me', payload);
      } else {
        // Admin editing any doctor profile
        await axiosInstance.put(`/doctors/${doctor._id}`, payload);
      }

      Alert.alert('Success', 'Doctor updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.formCard}>
            <CustomInput label="Name *" value={name} onChangeText={setName} placeholder="Doctor name" icon="person-outline" error={errors.name} />
            <CustomInput label="Specialization *" value={specialization} onChangeText={setSpecialization} placeholder="e.g. Cardiologist" icon="medical-outline" error={errors.specialization} />
            <CustomInput label="Qualification" value={qualification} onChangeText={setQualification} placeholder="e.g. MBBS, MD" icon="school-outline" />
            <CustomInput label="Years of Experience" value={experience} onChangeText={setExperience} placeholder="e.g. 10" keyboardType="numeric" icon="trophy-outline" />
            <CustomInput label="Hospital" value={hospital} onChangeText={setHospital} placeholder="Hospital name" icon="business-outline" />
            <CustomInput label="Consultation Fee (Rs.)" value={consultationFee} onChangeText={setConsultationFee} placeholder="e.g. 2500" keyboardType="numeric" icon="cash-outline" error={errors.consultationFee} />
            
            {/* Available Time Selector */}
            <View style={styles.daysSection}>
              <Text style={styles.daysLabel}>Available Time</Text>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <TouchableOpacity style={styles.timeButton} onPress={() => { setShowStartPicker(!showStartPicker); setShowEndPicker(false); }}>
                  <Ionicons name="time-outline" size={20} color="#4F46E5" />
                  <Text style={styles.timeButtonText}>{formatTime(startTime)}</Text>
                </TouchableOpacity>
                <Text style={{ color: '#6B7280', fontWeight: '500' }}>to</Text>
                <TouchableOpacity style={styles.timeButton} onPress={() => { setShowEndPicker(!showEndPicker); setShowStartPicker(false); }}>
                  <Ionicons name="time-outline" size={20} color="#4F46E5" />
                  <Text style={styles.timeButtonText}>{formatTime(endTime)}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {showStartPicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  if (Platform.OS === 'android') setShowStartPicker(false);
                  if (selectedDate) setStartTime(selectedDate);
                }}
              />
            )}
            {showEndPicker && (
              <DateTimePicker
                value={endTime}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  if (Platform.OS === 'android') setShowEndPicker(false);
                  if (selectedDate) setEndTime(selectedDate);
                }}
              />
            )}

            <View style={styles.daysSection}>
              <Text style={styles.daysLabel}>Available Days</Text>
              <View style={styles.daysContainer}>
                {DAYS.map((day) => (
                  <TouchableOpacity key={day} style={[styles.dayChip, availableDays.includes(day) && styles.dayChipActive]} onPress={() => toggleDay(day)}>
                    <Text style={[styles.dayChipText, availableDays.includes(day) && styles.dayChipTextActive]}>{day.substring(0, 3)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <CustomInput label="Bio" value={bio} onChangeText={setBio} placeholder="Short description" multiline={true} numberOfLines={3} icon="information-circle-outline" />

            <CustomButton title="Update Doctor" onPress={handleSubmit} loading={loading} style={{ marginTop: 8 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  flex: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 30 },
  formCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  daysSection: { marginBottom: 16 },
  daysLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  daysContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayChip: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB',
  },
  dayChipActive: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  dayChipText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  dayChipTextActive: { color: '#4F46E5' },
  timeButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12,
    borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', gap: 8, justifyContent: 'center'
  },
  timeButtonText: { fontSize: 14, color: '#374151', fontWeight: '500' },
});

export default EditDoctorScreen;
