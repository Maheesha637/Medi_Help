import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const DoctorHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [profileLinked, setProfileLinked] = useState(true);

  const fetchDoctorData = async () => {
    try {
      // Use the /me endpoint — reliable, no fragile name-matching
      const doctorRes = await axiosInstance.get('/doctors/me');
      setDoctorProfile(doctorRes.data);
      setProfileLinked(true);

      const appointmentsRes = await axiosInstance.get(`/appointments/doctor/${doctorRes.data._id}`);
      setAppointments(appointmentsRes.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setProfileLinked(false);
      } else {
        console.error('Error fetching doctor data:', error);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useFocusEffect(
    useCallback(() => {
      fetchDoctorData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDoctorData();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
      case 'confirmed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'rejected':
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/appointments/${id}/status`, { status });
      setAppointments(prev => prev.map(app => app._id === id ? { ...app, status } : app));
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const renderAppointmentCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Appointments', { 
        screen: 'AppointmentDetail', 
        params: { appointmentId: item._id } 
      })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.patientInfo}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{item.patientId?.name?.charAt(0) || 'P'}</Text>
          </View>
          <View>
            <Text style={styles.patientName}>{item.patientId?.name || 'Unknown Patient'}</Text>
            <Text style={styles.reason} numberOfLines={1}>{item.reason || 'General Checkup'}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text style={styles.footerText}>{new Date(item.appointmentDate).toLocaleDateString()}</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text style={styles.footerText}>{item.appointmentTime}</Text>
        </View>
      </View>
      {item.status === 'Pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => updateStatus(item._id, 'Rejected')}>
            <Text style={styles.rejectBtnText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={() => updateStatus(item._id, 'Accepted')}>
            <Text style={styles.acceptBtnText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) return <LoadingSpinner message="Loading your dashboard..." />;

  if (!profileLinked) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.header]}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.doctorName}>Dr. {user.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileIcon}
            onPress={() => navigation.navigate('ProfileTab')}
          >
            <Ionicons name="person-circle" size={45} color="#4F46E5" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 }}>
          <Ionicons name="alert-circle-outline" size={70} color="#F59E0B" />
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#1F2937', marginTop: 16, textAlign: 'center' }}>
            Profile Not Linked
          </Text>
          <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center', lineHeight: 22 }}>
            Your user account is not linked to a doctor profile in the system.{`\n\n`}
            Please ask your administrator to make sure the name on your doctor profile exactly matches your account name: {`"${user.name}"`}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.doctorName}>Dr. {user.name}</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileIcon}
          onPress={() => navigation.navigate('ProfileTab')}
        >
          {user.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
          ) : (
            <Ionicons name="person-circle" size={45} color="#4F46E5" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#4F46E5' }]}>
          <Text style={styles.statValue}>{appointments.length}</Text>
          <Text style={styles.statLabel}>Appointments</Text>
        </View>
        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: '#10B981' }]}
          onPress={() => {
            if (doctorProfile) {
              navigation.navigate('EditDoctor', { doctor: doctorProfile, useMyProfile: true });
            } else {
              Alert.alert(
                'Profile Not Linked',
                'Your user account is not linked to a professional doctor profile. Please contact the administrator.'
              );
            }
          }}
        >
          <Ionicons name="time" size={24} color="#FFFFFF" />
          <Text style={styles.statLabel}>Manage Time</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Upcoming Patients</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Appointments')}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={appointments}
        keyExtractor={(item) => item._id}
        renderItem={renderAppointmentCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyText}>No upcoming appointments</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  welcomeText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  doctorName: { fontSize: 20, fontWeight: '800', color: '#1F2937', marginTop: 2 },
  profileImage: { width: 45, height: 45, borderRadius: 22.5 },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  statValue: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  statLabel: { fontSize: 12, color: '#FFFFFF', fontWeight: '600', marginTop: 4 },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  listTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  viewAll: { fontSize: 14, color: '#4F46E5', fontWeight: '600' },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  patientInfo: { flexDirection: 'row', gap: 12, flex: 1 },
  avatarPlaceholder: {
    width: 45, height: 45, borderRadius: 12,
    backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center'
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#4F46E5' },
  patientName: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  reason: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF', textTransform: 'uppercase' },
  cardFooter: {
    flexDirection: 'row',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 15
  },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, color: '#9CA3AF', marginTop: 12 },
  actionButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  actionBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1 },
  rejectBtn: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  rejectBtnText: { color: '#EF4444', fontWeight: '600', fontSize: 13 },
  acceptBtn: { borderColor: '#10B981', backgroundColor: '#10B981' },
  acceptBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
});

export default DoctorHomeScreen;
