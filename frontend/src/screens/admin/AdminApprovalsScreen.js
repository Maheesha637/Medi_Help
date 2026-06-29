import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, RefreshControl, Image, Modal, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axiosInstance from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';
import CustomButton from '../../components/CustomButton';

const AdminApprovalsScreen = () => {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchPendingDoctors = async () => {
    try {
      const response = await axiosInstance.get('/auth/pending-doctors');
      setPendingDoctors(response.data);
    } catch (error) {
      console.error('Error fetching pending doctors:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPendingDoctors();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPendingDoctors();
  };

  const handleAction = async (doctorId, action) => {
    try {
      setModalVisible(false);
      await axiosInstance.put(`/auth/${action}/${doctorId}`);
      Alert.alert('Success', `Doctor ${action}ed successfully`);
      fetchPendingDoctors();
    } catch (error) {
      Alert.alert('Error', `Failed to ${action} doctor`);
    }
  };

  const renderDoctorItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => {
        setSelectedDoctor(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          {item.profileImage ? (
            <Image source={{ uri: item.profileImage }} style={styles.avatar} />
          ) : (
            <Ionicons name="person" size={30} color="#4F46E5" />
          )}
        </View>
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{item.name}</Text>
          <Text style={styles.doctorSub}>{item.specialization} • {item.experience || 0} Yrs Exp</Text>
        </View>
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingBadgeText}>Pending</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) return <LoadingSpinner message="Checking for pending approvals..." />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Approvals</Text>
        <Text style={styles.subtitle}>Doctor verification requests</Text>
      </View>

      <FlatList
        data={pendingDoctors}
        keyExtractor={(item) => item._id}
        renderItem={renderDoctorItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-circle-outline" size={80} color="#D1D5DB" />
            <Text style={styles.emptyText}>No pending approvals at the moment.</Text>
          </View>
        }
      />

      {/* Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Doctor Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            {selectedDoctor && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalBody}>
                  <View style={styles.modalAvatarContainer}>
                    {selectedDoctor.profileImage ? (
                      <Image source={{ uri: selectedDoctor.profileImage }} style={styles.modalAvatar} />
                    ) : (
                      <View style={[styles.modalAvatar, styles.modalAvatarPlaceholder]}>
                        <Ionicons name="person" size={60} color="#4F46E5" />
                      </View>
                    )}
                  </View>

                  <Text style={styles.detailName}>{selectedDoctor.name}</Text>
                  <Text style={styles.detailEmail}>{selectedDoctor.email}</Text>
                  <Text style={styles.detailRole}>Role: {selectedDoctor.role}</Text>

                  <View style={styles.divider} />

                  <View style={styles.infoRow}>
                    <View style={styles.infoCol}>
                      <Text style={styles.infoLabel}>Specialization</Text>
                      <Text style={styles.infoValue}>{selectedDoctor.specialization || 'Not specified'}</Text>
                    </View>
                    <View style={styles.infoCol}>
                      <Text style={styles.infoLabel}>Experience</Text>
                      <Text style={styles.infoValue}>{selectedDoctor.experience || 0} Years</Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoCol}>
                      <Text style={styles.infoLabel}>Phone</Text>
                      <Text style={styles.infoValue}>{selectedDoctor.phone || 'Not provided'}</Text>
                    </View>
                    <View style={styles.infoCol}>
                      <Text style={styles.infoLabel}>Fee</Text>
                      <Text style={styles.infoValue}>Rs. {selectedDoctor.consultationFee || 0}</Text>
                    </View>
                  </View>

                  <View style={styles.modalActions}>
                    <CustomButton 
                      title="Reject" 
                      onPress={() => handleAction(selectedDoctor._id, 'reject')}
                      variant="danger"
                      style={styles.modalBtn}
                    />
                    <CustomButton 
                      title="Approve" 
                      onPress={() => handleAction(selectedDoctor._id, 'approve')}
                      style={styles.modalBtn}
                    />
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  title: { fontSize: 24, fontWeight: '800', color: '#1F2937' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  listContent: { padding: 16 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center', marginRight: 12, overflow: 'hidden',
  },
  avatar: { width: 50, height: 50 },
  doctorInfo: { flex: 1 },
  doctorName: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  doctorSub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  pendingBadge: {
    backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  pendingBadgeText: { color: '#D97706', fontSize: 11, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyText: { fontSize: 15, color: '#9CA3AF', marginTop: 12, fontWeight: '500', textAlign: 'center' },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingBottom: 40, maxHeight: '85%' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 24, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1F2937' },
  modalBody: { padding: 24, alignItems: 'center' },
  modalAvatarContainer: { marginBottom: 16 },
  modalAvatar: { width: 120, height: 120, borderRadius: 60 },
  modalAvatarPlaceholder: { backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  detailName: { fontSize: 22, fontWeight: '800', color: '#1F2937' },
  detailEmail: { fontSize: 15, color: '#6B7280', marginTop: 4 },
  detailRole: { fontSize: 14, color: '#4F46E5', fontWeight: '600', marginTop: 4, textTransform: 'uppercase' },
  divider: { width: '100%', height: 1, backgroundColor: '#F3F4F6', marginVertical: 20 },
  infoRow: { flexDirection: 'row', width: '100%', marginBottom: 16 },
  infoCol: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700' },
  infoValue: { fontSize: 16, color: '#1F2937', fontWeight: '600', marginTop: 4 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 24, width: '100%' },
  modalBtn: { flex: 1 },
});

export default AdminApprovalsScreen;
