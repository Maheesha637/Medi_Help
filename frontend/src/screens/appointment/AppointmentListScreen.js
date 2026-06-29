import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const statusColors = {
  Pending: { bg: '#FEF3C7', text: '#D97706' },
  Confirmed: { bg: '#D1FAE5', text: '#059669' },
  Completed: { bg: '#DBEAFE', text: '#2563EB' },
  Cancelled: { bg: '#FEE2E2', text: '#DC2626' },
  Accepted: { bg: '#D1FAE5', text: '#059669' },
  Rejected: { bg: '#FEE2E2', text: '#DC2626' },
};

const AppointmentListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const isDoctor = user?.role === 'doctor';

  const fetchAppointments = async () => {
    try {
      let endpoint = '/appointments/my';
      if (user?.role === 'admin') {
        endpoint = '/appointments';
      } else if (isDoctor) {
        // Find doctor profile ID first using /me
        try {
          const profileRes = await axiosInstance.get('/doctors/me');
          if (profileRes.data && profileRes.data._id) {
            endpoint = `/appointments/doctor/${profileRes.data._id}`;
          }
        } catch (err) {
          if (err.response?.status === 404) {
            // Profile not linked yet, return empty list
            setAppointments([]);
            setFilteredAppointments([]);
            setLoading(false);
            setRefreshing(false);
            return;
          }
          throw err;
        }
      }
      
      const response = await axiosInstance.get(endpoint);
      setAppointments(response.data);
      applyFilter(response.data, filterStatus);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilter = (data, status) => {
    if (status === 'All') {
      setFilteredAppointments(data);
    } else {
      setFilteredAppointments(data.filter(app => app.status.toLowerCase() === status.toLowerCase()));
    }
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    applyFilter(appointments, status);
  };

  const updateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/appointments/${id}/status`, { status });
      const updatedList = appointments.map(app => app._id === id ? { ...app, status } : app);
      setAppointments(updatedList);
      applyFilter(updatedList, filterStatus);
    } catch (error) {
      console.error('Error updating status', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [])
  );

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const renderAppointment = ({ item }) => {
    const colors = statusColors[item.status] || statusColors.Pending;
    const displayName = isDoctor ? (item.patientId?.name || 'Unknown Patient') : (`Dr. ${item.doctorId?.name || 'Unknown Doctor'}`);
    const subText = isDoctor ? (item.patientId?.phone || 'No phone') : (item.doctorId?.specialization || '');

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item._id })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardLeft}>
            <View style={styles.iconBox}>
              <Ionicons name={isDoctor ? "person" : "calendar"} size={22} color="#4F46E5" />
            </View>
            <View>
              <Text style={styles.doctorName}>{displayName}</Text>
              <Text style={styles.spec}>{subText}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.statusText, { color: colors.text }]}>{item.status}</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.dateText}>{formatDate(item.appointmentDate)}</Text>
          </View>
          <View style={styles.dateRow}>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text style={styles.dateText}>{item.appointmentTime}</Text>
          </View>
        </View>

      </TouchableOpacity>
    );
  };

  if (loading) return <LoadingSpinner message="Loading appointments..." />;

  const isAdmin = user?.role === 'admin';
  const filterOptions = isAdmin 
    ? ['All', 'Confirmed', 'Completed', 'Cancelled']
    : ['All', 'Accepted', 'Rejected'];

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {(isDoctor || isAdmin) && (
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {filterOptions.map(status => (
              <TouchableOpacity
                key={status}
                style={[styles.filterChip, filterStatus === status && styles.filterChipActive]}
                onPress={() => handleFilterChange(status)}
              >
                <Text style={[styles.filterChipText, filterStatus === status && styles.filterChipTextActive]}>{status}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      <FlatList
        data={filteredAppointments}
        keyExtractor={(item) => item._id}
        renderItem={renderAppointment}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAppointments(); }} colors={['#4F46E5']} />
        }
        ListHeaderComponent={
          user?.role === 'patient' ? (
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => navigation.navigate('BookAppointmentFromList')}
            >
              <Ionicons name="add-circle" size={22} color="#FFFFFF" />
              <Text style={styles.bookButtonText}>Book New Appointment</Text>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyText}>No appointments yet</Text>
            {user?.role === 'patient' && <Text style={styles.emptySubtext}>Book your first appointment</Text>}
          </View>
        }
      />
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  listContent: { padding: 16, paddingBottom: 20 },
  bookButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#4F46E5', paddingVertical: 14, borderRadius: 12,
    marginBottom: 16, gap: 8,
  },
  bookButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16,
    marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  doctorName: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  spec: { fontSize: 12, color: '#6B7280', marginTop: 1 },
  statusBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardFooter: {
    flexDirection: 'row', gap: 20, marginTop: 12,
    paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 13, color: '#6B7280' },
  emptyContainer: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, color: '#9CA3AF', marginTop: 12, fontWeight: '600' },
  emptySubtext: { fontSize: 13, color: '#D1D5DB', marginTop: 4 },
  filterContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 5, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  filterChipActive: { backgroundColor: '#EEF2FF', borderColor: '#4F46E5' },
  filterChipText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  filterChipTextActive: { color: '#4F46E5' },
  actionButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  actionBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1 },
  rejectBtn: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  rejectBtnText: { color: '#EF4444', fontWeight: '600', fontSize: 13 },
  acceptBtn: { borderColor: '#10B981', backgroundColor: '#10B981' },
  acceptBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
});

export default AppointmentListScreen;
