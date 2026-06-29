import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import CustomButton from '../../components/CustomButton';
import LoadingSpinner from '../../components/LoadingSpinner';

const DoctorDetailScreen = ({ route, navigation }) => {
  const { doctorId } = route.params;
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctor();
  }, []);

  const fetchDoctor = async () => {
    try {
      const response = await axiosInstance.get(`/doctors/${doctorId}`);
      setDoctor(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load doctor details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Deactivate Doctor', 'Are you sure you want to deactivate this doctor?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Deactivate',
        style: 'destructive',
        onPress: async () => {
          try {
            await axiosInstance.delete(`/doctors/${doctorId}`);
            Alert.alert('Success', 'Doctor deactivated');
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', 'Failed to deactivate doctor');
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingSpinner message="Loading doctor profile..." />;
  if (!doctor) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {doctor.profileImage ? (
              <Image source={{ uri: doctor.profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color="#4F46E5" />
              </View>
            )}
          </View>
          <Text style={styles.doctorName}>Dr. {doctor.name}</Text>
          <Text style={styles.specialization}>{doctor.specialization}</Text>
          {doctor.hospital ? (
            <View style={styles.hospitalRow}>
              <Ionicons name="business-outline" size={14} color="#6B7280" />
              <Text style={styles.hospital}>{doctor.hospital}</Text>
            </View>
          ) : null}
        </View>

        {/* Info Cards */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoValue}>{doctor.experience || 0}</Text>
            <Text style={styles.infoLabel}>Years Exp.</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={[styles.infoValue, { color: '#10B981' }]}>Rs. {doctor.consultationFee}</Text>
            <Text style={styles.infoLabel}>Fee</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoValue}>{doctor.availableDays?.length || 0}</Text>
            <Text style={styles.infoLabel}>Days/Week</Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.section}>
          {doctor.qualification ? (
            <View style={styles.detailRow}>
              <Ionicons name="school-outline" size={18} color="#4F46E5" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Qualification</Text>
                <Text style={styles.detailValue}>{doctor.qualification}</Text>
              </View>
            </View>
          ) : null}

          {doctor.availableDays?.length > 0 ? (
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={18} color="#4F46E5" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Available Days</Text>
                <View style={styles.daysContainer}>
                  {doctor.availableDays.map((day, index) => (
                    <View key={index} style={styles.dayChip}>
                      <Text style={styles.dayChipText}>{day}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ) : null}

          {doctor.availableTime ? (
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={18} color="#4F46E5" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Available Time</Text>
                <Text style={styles.detailValue}>{doctor.availableTime}</Text>
              </View>
            </View>
          ) : null}

          {doctor.bio ? (
            <View style={styles.detailRow}>
              <Ionicons name="information-circle-outline" size={18} color="#4F46E5" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>About</Text>
                <Text style={styles.detailValue}>{doctor.bio}</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {user?.role === 'patient' && (
            <CustomButton
              title="Book Appointment"
              onPress={() => navigation.navigate('BookAppointment', { doctor })}
            />
          )}

          {user?.role === 'admin' && (
            <>
              <CustomButton
                title="Edit Doctor"
                onPress={() => navigation.navigate('EditDoctor', { doctor })}
                variant="outline"
              />
              <CustomButton
                title="Deactivate Doctor"
                onPress={handleDelete}
                variant="danger"
              />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  doctorName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },
  specialization: {
    fontSize: 15,
    color: '#4F46E5',
    fontWeight: '600',
    marginTop: 2,
  },
  hospitalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  hospital: {
    fontSize: 13,
    color: '#6B7280',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 16,
    gap: 10,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  dayChip: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  dayChipText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
  },
  actions: {
    paddingHorizontal: 16,
    gap: 4,
  },
});

export default DoctorDetailScreen;
