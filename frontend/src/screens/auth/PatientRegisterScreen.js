import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

const PatientRegisterScreen = ({ navigation }) => {
  const { registerPatient } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    const result = await registerPatient(name.trim(), email.trim().toLowerCase(), password, phone.trim());
    setLoading(false);

    if (!result.success) {
      Alert.alert('Registration Failed', result.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Patient Sign Up</Text>
            <Text style={styles.subtitle}>Create your patient account</Text>
          </View>

          <View style={styles.formCard}>
            <CustomInput label="Full Name" value={name} onChangeText={setName} placeholder="John Doe" icon="person-outline" error={errors.name} />
            <CustomInput label="Email Address" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" icon="mail-outline" error={errors.email} />
            <CustomInput label="Phone Number" value={phone} onChangeText={setPhone} placeholder="0771234567" keyboardType="phone-pad" icon="call-outline" maxLength={10} error={errors.phone} />
            <CustomInput label="Password" value={password} onChangeText={setPassword} placeholder="Min 8 characters" secureTextEntry={true} icon="lock-closed-outline" error={errors.password} />
            <CustomInput label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Repeat password" secureTextEntry={true} icon="lock-closed-outline" error={errors.confirmPassword} />

            <CustomButton title="Create Account" onPress={handleRegister} loading={loading} style={{ marginTop: 8 }} />

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
  safe: { flex: 1, backgroundColor: '#4F46E5' },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: { alignItems: 'center', paddingTop: 30, paddingBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  subtitle: { fontSize: 15, color: 'rgba(255, 255, 255, 0.8)', marginTop: 4 },
  formCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30,
    paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { fontSize: 14, color: '#6B7280' },
  linkText: { fontSize: 14, color: '#4F46E5', fontWeight: '700' },
});

export default PatientRegisterScreen;
