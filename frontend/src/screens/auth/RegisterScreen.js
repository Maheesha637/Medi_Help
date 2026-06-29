import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const RegisterScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Join MediHelp</Text>
          <Text style={styles.subtitle}>Choose your account type</Text>
        </View>

        <View style={styles.selectionContainer}>
          <TouchableOpacity 
            style={[styles.card, styles.patientCard]} 
            onPress={() => navigation.navigate('PatientRegister')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="person" size={40} color="#4F46E5" />
            </View>
            <Text style={styles.cardTitle}>I am a Patient</Text>
            <Text style={styles.cardSubtitle}>Book appointments and view your medical records</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.card, styles.doctorCard]} 
            onPress={() => navigation.navigate('DoctorRegister')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="medical" size={40} color="#10B981" />
            </View>
            <Text style={styles.cardTitle}>I am a Doctor</Text>
            <Text style={styles.cardSubtitle}>Manage appointments and provide medical consultations</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 32, fontWeight: '800', color: '#1F2937' },
  subtitle: { fontSize: 16, color: '#6B7280', marginTop: 8 },
  selectionContainer: { gap: 20 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 5,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  iconContainer: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  cardSubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { fontSize: 15, color: '#6B7280' },
  linkText: { fontSize: 15, color: '#4F46E5', fontWeight: '700' },
});

export default RegisterScreen;
