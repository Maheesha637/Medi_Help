import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, RefreshControl, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const DoctorListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchDoctors = async (specialization = '') => {
    try {
      const params = specialization ? { specialization } : {};
      const response = await axiosInstance.get('/doctors', { params });
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDoctors();
    }, [])
  );

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchDoctors(search);
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [search]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDoctors(search);
  };

  const renderDoctorCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('DoctorDetail', { doctorId: item._id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.avatarBox}>
          {item.profileImage ? (
            <Image source={{ uri: item.profileImage }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person" size={28} color="#4F46E5" />
          )}
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.doctorName}>Dr. {item.name}</Text>
          <Text style={styles.specialization}>{item.specialization}</Text>
          <View style={styles.feeRow}>
            <Ionicons name="cash-outline" size={14} color="#10B981" />
            <Text style={styles.fee}>Rs. {item.consultationFee}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  if (loading) return <LoadingSpinner message="Loading doctors..." />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by specialization..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Admin: Add Doctor Button */}
      {(user?.role?.toLowerCase() === 'admin') && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddDoctor')}
        >
          <Ionicons name="add-circle" size={22} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Doctor</Text>
        </TouchableOpacity>
      )}

      {/* Doctor List */}
      <FlatList
        data={doctors}
        keyExtractor={(item) => item._id}
        renderItem={renderDoctorCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="medical-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyText}>No doctors found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1F2937',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  cardInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  specialization: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  fee: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
});

export default DoctorListScreen;
