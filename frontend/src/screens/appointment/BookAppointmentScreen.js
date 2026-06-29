import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../../api/axiosInstance';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import LoadingSpinner from '../../components/LoadingSpinner';

const GENERATED_TIME_SLOTS = (startTimeStr, endTimeStr) => {
  const parseTimeToMinutes = (timeStr) => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const minutesToTimeStr = (totalMinutes) => {
    let hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours || 12;
    const minsStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minsStr} ${ampm}`;
  };

  if (!startTimeStr || !endTimeStr) return [];

  const startMins = parseTimeToMinutes(startTimeStr);
  const endMins = parseTimeToMinutes(endTimeStr);
  const slots = [];

  for (let mins = startMins; mins <= endMins; mins += 30) {
    slots.push(minutesToTimeStr(mins));
  }

  return slots;
};

const BookAppointmentScreen = ({ route, navigation }) => {
  const preselectedDoctor = route.params?.doctor;
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(preselectedDoctor || null);
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(!preselectedDoctor);

  useEffect(() => {
    if (!preselectedDoctor) {
      fetchDoctors();
    }
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axiosInstance.get('/doctors');
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const formatDate = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const getDayName = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  const isDayAvailable = () => {
    if (!selectedDoctor?.availableDays || selectedDoctor.availableDays.length === 0) return true;
    return selectedDoctor.availableDays.includes(getDayName(appointmentDate));
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) {
      setAppointmentDate(selectedDate);
      setSelectedTime(''); // Reset time when date changes
    }
  };

  const handleSubmit = () => {
    if (!selectedDoctor) {
      Alert.alert('Error', 'Please select a doctor');
      return;
    }
    if (!isDayAvailable()) {
      Alert.alert('Error', `Dr. ${selectedDoctor.name} is not available on ${getDayName(appointmentDate)}s. Please select an available day: ${selectedDoctor.availableDays.join(', ')}`);
      return;
    }
    if (!selectedTime) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }

    navigation.navigate('BookingPayment', {
      appointmentData: {
        doctorId: selectedDoctor._id,
        appointmentDate: appointmentDate.toISOString(),
        appointmentTime: selectedTime,
        reason: reason.trim(),
      },
      doctor: selectedDoctor
    });
  };

  if (loadingDoctors) return <LoadingSpinner message="Loading doctors..." />;

  const getFilteredTimeSlots = () => {
    if (!selectedDoctor?.availableTime || !selectedDoctor.availableTime.includes('-')) {
      return [];
    }
    const [startStr, endStr] = selectedDoctor.availableTime.split('-').map(s => s.trim());
    return GENERATED_TIME_SLOTS(startStr, endStr);
  };

  const filteredTimeSlots = getFilteredTimeSlots();

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Doctor Selection */}
        {!preselectedDoctor && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Doctor</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {doctors.map((doc) => (
                <TouchableOpacity
                  key={doc._id}
                  style={[styles.doctorChip, selectedDoctor?._id === doc._id && styles.doctorChipActive]}
                  onPress={() => {
                    setSelectedDoctor(doc);
                    setSelectedTime('');
                  }}
                >
                  <Text style={[styles.doctorChipName, selectedDoctor?._id === doc._id && styles.doctorChipNameActive]}>
                    Dr. {doc.name}
                  </Text>
                  <Text style={[styles.doctorChipSpec, selectedDoctor?._id === doc._id && styles.doctorChipSpecActive]}>
                    {doc.specialization}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Selected Doctor Info */}
        {selectedDoctor && (
          <View style={styles.selectedDoctorCard}>
            <Ionicons name="person-circle" size={40} color="#4F46E5" />
            <View style={styles.selectedDoctorInfo}>
              <Text style={styles.selectedDoctorName}>Dr. {selectedDoctor.name}</Text>
              <Text style={styles.selectedDoctorSpec}>{selectedDoctor.specialization}</Text>
              <View style={styles.availabilityRow}>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text style={styles.selectedDoctorAvailability}>{selectedDoctor.availableTime || 'Not set'}</Text>
              </View>
              <Text style={styles.selectedDoctorFee}>Fee: Rs. {selectedDoctor.consultationFee}</Text>
            </View>
          </View>
        )}

        {/* Date Picker */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={styles.sectionTitle}>Select Date</Text>
            {!isDayAvailable() && (
              <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '600' }}>Not available</Text>
            )}
          </View>
          <TouchableOpacity style={[styles.dateButton, !isDayAvailable() && { borderColor: '#EF4444' }]} onPress={() => setShowDatePicker(!showDatePicker)}>
            <Ionicons name="calendar-outline" size={20} color={isDayAvailable() ? "#4F46E5" : "#EF4444"} />
            <Text style={[styles.dateButtonText, !isDayAvailable() && { color: '#EF4444' }]}>
              {formatDate(appointmentDate)}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={appointmentDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}
          {selectedDoctor?.availableDays?.length > 0 && (
            <Text style={styles.daysHelpText}>Available on: {selectedDoctor.availableDays.join(', ')}</Text>
          )}
        </View>

        {/* Time Slots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          {filteredTimeSlots.length > 0 ? (
            <View style={styles.timeGrid}>
              {filteredTimeSlots.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[styles.timeSlot, selectedTime === time && styles.timeSlotActive]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text style={[styles.timeSlotText, selectedTime === time && styles.timeSlotTextActive]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptySlots}>
              <Ionicons name="alert-circle-outline" size={24} color="#9CA3AF" />
              <Text style={styles.emptySlotsText}>No slots available for this doctor's hours.</Text>
            </View>
          )}
        </View>


        {/* Reason */}
        <View style={styles.section}>
          <CustomInput
            label="Reason for Visit"
            value={reason}
            onChangeText={setReason}
            placeholder="Describe your symptoms or reason"
            multiline={true}
            numberOfLines={3}
            icon="document-text-outline"
          />
        </View>

        <View style={styles.actions}>
          <CustomButton title="Book Appointment" onPress={handleSubmit} loading={loading} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { padding: 16, paddingBottom: 30 },
  section: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  doctorChip: {
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E5E7EB', marginRight: 10, backgroundColor: '#F9FAFB',
    minWidth: 120, alignItems: 'center',
  },
  doctorChipActive: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  doctorChipName: { fontSize: 13, fontWeight: '700', color: '#374151' },
  doctorChipNameActive: { color: '#4F46E5' },
  doctorChipSpec: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  doctorChipSpecActive: { color: '#6366F1' },
  selectedDoctorCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 16, padding: 16, marginBottom: 12, gap: 12,
  },
  selectedDoctorInfo: { flex: 1 },
  selectedDoctorName: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  selectedDoctorSpec: { fontSize: 13, color: '#6B7280', marginTop: 1 },
  selectedDoctorFee: { fontSize: 14, color: '#10B981', fontWeight: '600', marginTop: 4 },
  availabilityRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  selectedDoctorAvailability: { fontSize: 12, color: '#6B7280' },
  dateButton: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16,
    borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', gap: 10,
  },
  dateButtonText: { fontSize: 15, color: '#374151', fontWeight: '500' },
  daysHelpText: { fontSize: 12, color: '#6B7280', marginTop: 8, fontStyle: 'italic' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeSlot: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB',
  },
  timeSlotActive: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  timeSlotText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  timeSlotTextActive: { color: '#4F46E5' },
  emptySlots: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  emptySlotsText: { fontSize: 14, color: '#9CA3AF', textAlign: 'center' },
  actions: { marginTop: 4 },
});

export default BookAppointmentScreen;
