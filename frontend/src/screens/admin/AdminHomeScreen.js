import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, RefreshControl, Image, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axiosInstance from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminHomeScreen = ({ navigation }) => {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    appointmentsToday: 0,
    pendingAppointments: 0,
  });
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('Doctors');

  const fetchData = async () => {
    try {
      const [statsRes, doctorsRes, patientsRes] = await Promise.all([
        axiosInstance.get('/admin/stats'),
        axiosInstance.get('/doctors'),
        axiosInstance.get('/auth/patients')
      ]);
      setStats(statsRes.data);
      setDoctors(doctorsRes.data);
      setPatients(patientsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleDeleteDoctor = (id) => {
    Alert.alert('Delete Doctor', 'Are you sure you want to delete this doctor?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await axiosInstance.delete(`/doctors/${id}`);
            Alert.alert('Success', 'Doctor deleted');
            fetchData();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete doctor');
          }
        }
      }
    ]);
  };

  const handleDeletePatient = (id) => {
    Alert.alert('Delete Patient', 'Are you sure? This will delete all their appointments and records.', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await axiosInstance.delete(`/admin/patients/${id}`);
            Alert.alert('Success', 'Patient and all data deleted');
            fetchData();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete patient');
          }
        }
      }
    ]);
  };

  const StatCard = ({ title, value, icon, color }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{title}</Text>
      </View>
    </View>
  );

  const renderDoctorItem = ({ item }) => (
    <View style={styles.listItem}>
      <View style={styles.itemAvatar}>
        {item.profileImage ? (
          <Image source={{ uri: item.profileImage }} style={styles.avatarImg} />
        ) : (
          <Ionicons name="person" size={24} color="#4F46E5" />
        )}
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>Dr. {item.name}</Text>
        <Text style={styles.itemSub}>{item.specialization}</Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity onPress={() => navigation.navigate('DoctorDetail', { doctorId: item._id })}>
          <Ionicons name="eye-outline" size={22} color="#4F46E5" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteDoctor(item._id)}>
          <Ionicons name="trash-outline" size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPatientItem = ({ item }) => (
    <View style={styles.listItem}>
      <View style={styles.itemAvatar}>
        {item.profileImage ? (
          <Image source={{ uri: item.profileImage }} style={styles.avatarImg} />
        ) : (
          <Ionicons name="person" size={24} color="#10B981" />
        )}
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemSub}>{item.email}</Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity onPress={() => Alert.alert('Patient Details', `Name: ${item.name}\nEmail: ${item.email}\nPhone: ${item.phone || 'N/A'}\nJoined: ${new Date(item.createdAt).toLocaleDateString()}`)}>
          <Ionicons name="information-circle-outline" size={22} color="#4F46E5" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeletePatient(item._id)}>
          <Ionicons name="trash-outline" size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Welcome back, Administrator</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statRow}>
            <StatCard title="Doctors" value={stats.totalDoctors} icon="medical" color="#4F46E5" />
            <StatCard title="Patients" value={stats.totalPatients} icon="people" color="#10B981" />
          </View>
          <View style={styles.statRow}>
            <StatCard title="Revenue" value={`Rs. ${stats.totalRevenue || 0}`} icon="cash" color="#059669" />
            <StatCard title="Unpaid Cash" value={stats.unpaidCashPaymentsCount || 0} icon="receipt" color="#F59E0B" />
          </View>
          <View style={styles.statRow}>
            <StatCard title="Today's Appt" value={stats.appointmentsToday} icon="calendar" color="#4F46E5" />
            <StatCard title="Pending Appt" value={stats.pendingAppointments} icon="time" color="#EF4444" />
          </View>
        </View>

        {/* Management Section */}
        <View style={styles.managementSection}>
          <View style={styles.tabBar}>
            {['Doctors', 'Patients'].map(tab => (
              <TouchableOpacity 
                key={tab} 
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={activeTab === 'Doctors' ? doctors : patients}
            keyExtractor={item => item._id}
            renderItem={activeTab === 'Doctors' ? renderDoctorItem : renderPatientItem}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No {activeTab.toLowerCase()} found</Text>
              </View>
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { paddingBottom: 20 },
  header: { padding: 20, backgroundColor: '#FFFFFF' },
  title: { fontSize: 24, fontWeight: '800', color: '#1F2937' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  statsGrid: { padding: 16, gap: 12 },
  statRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  statIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: '#1F2937' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  managementSection: { marginHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16 },
  tabBar: { flexDirection: 'row', gap: 16, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  tab: { paddingVertical: 12, paddingHorizontal: 4 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#4F46E5' },
  tabText: { fontSize: 16, fontWeight: '600', color: '#9CA3AF' },
  activeTabText: { color: '#4F46E5' },
  listItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F9FAFB',
  },
  itemAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImg: { width: 44, height: 44 },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  itemSub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  itemActions: { flexDirection: 'row', gap: 12 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#9CA3AF' },
});

export default AdminHomeScreen;
