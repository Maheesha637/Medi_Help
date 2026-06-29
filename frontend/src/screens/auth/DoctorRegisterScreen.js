import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

const DoctorRegisterScreen = ({ navigation }) => {
  const { registerDoctor } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');
  const [fee, setFee] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (phone.trim().length !== 10) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    if (!specialization.trim()) newErrors.specialization = 'Specialization is required';
    if (!experience.trim()) newErrors.experience = 'Experience is required';
    if (!fee.trim()) newErrors.fee = 'Consultation fee is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    const result = await registerDoctor({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      phone: phone.trim(),
      specialization: specialization.trim(),
      experience: Number(experience),
      consultationFee: Number(fee),
      availableTime: `${formatTime(startTime)} - ${formatTime(endTime)}`,
    });
    setLoading(false);

    if (result.success) {
      Alert.alert('Registration Successful', result.message, [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } else {
      Alert.alert('Registration Failed', result.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Doctor Sign Up</Text>
            <Text style={styles.subtitle}>Apply to join MediHelp as a doctor</Text>
          </View>

          <View style={styles.formCard}>
            <CustomInput label="Full Name" value={name} onChangeText={setName} placeholder="Dr. John Doe" icon="person-outline" error={errors.name} />
            <CustomInput label="Email Address" value={email} onChangeText={setEmail} placeholder="doctor@medihelp.com" keyboardType="email-address" icon="mail-outline" error={errors.email} />
            <CustomInput label="Phone Number" value={phone} onChangeText={setPhone} placeholder="0771234567" keyboardType="phone-pad" icon="call-outline" maxLength={10} error={errors.phone} />
            <CustomInput label="Specialization" value={specialization} onChangeText={setSpecialization} placeholder="e.g. Cardiologist" icon="medical-outline" error={errors.specialization} />
            <View style={styles.row}>
              <View style={styles.half}>
                <CustomInput label="Experience (Years)" value={experience} onChangeText={setExperience} placeholder="5" keyboardType="numeric" icon="time-outline" error={errors.experience} />
              </View>
              <View style={styles.half}>
                <CustomInput label="Fee (Rs.)" value={fee} onChangeText={setFee} placeholder="2000" keyboardType="numeric" icon="cash-outline" error={errors.fee} />
              </View>
            </View>
            <Text style={styles.fieldLabel}>Available Hours *</Text>
            <View style={styles.timeRow}>
              <TouchableOpacity style={styles.timeButton} onPress={() => setShowStartPicker(true)}>
                <Ionicons name="time-outline" size={18} color="#10B981" />
                <Text style={styles.timeButtonText}>{formatTime(startTime)}</Text>
              </TouchableOpacity>
              <Text style={styles.toText}>to</Text>
              <TouchableOpacity style={styles.timeButton} onPress={() => setShowEndPicker(true)}>
                <Ionicons name="time-outline" size={18} color="#10B981" />
                <Text style={styles.timeButtonText}>{formatTime(endTime)}</Text>
              </TouchableOpacity>
            </View>

            {showStartPicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
                onChange={(event, selectedDate) => {
                  setShowStartPicker(false);
                  if (selectedDate) {
                    setStartTime(selectedDate);
                  }
                }}
              />
            )}
            {showEndPicker && (
              <DateTimePicker
                value={endTime}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
                onChange={(event, selectedDate) => {
                  setShowEndPicker(false);
                  if (selectedDate) {
                    setEndTime(selectedDate);
                  }
                }}
              />
            )}
            
            <CustomInput label="Password" value={password} onChangeText={setPassword} placeholder="Min 8 characters" secureTextEntry={true} icon="lock-closed-outline" error={errors.password} />
            <CustomInput label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Repeat password" secureTextEntry={true} icon="lock-closed-outline" error={errors.confirmPassword} />

            <CustomButton title="Submit Application" onPress={handleRegister} loading={loading} style={{ marginTop: 8 }} />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#10B981' },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: { alignItems: 'center', paddingTop: 30, paddingBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  subtitle: { fontSize: 15, color: 'rgba(255, 255, 255, 0.8)', marginTop: 4 },
  formCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30,
    paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40,
  },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    gap: 8,
    justifyContent: 'center',
  },
  timeButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  toText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { fontSize: 14, color: '#6B7280' },
  linkText: { fontSize: 14, color: '#10B981', fontWeight: '700' },
});

export default DoctorRegisterScreen;
