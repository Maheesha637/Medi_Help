import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';

import { useAuth } from '../context/AuthContext';
import DoctorListScreen from '../screens/doctor/DoctorListScreen';
import DoctorDetailScreen from '../screens/doctor/DoctorDetailScreen';
import DoctorHomeScreen from '../screens/doctor/DoctorHomeScreen';
import AddDoctorScreen from '../screens/doctor/AddDoctorScreen';
import EditDoctorScreen from '../screens/doctor/EditDoctorScreen';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import AdminApprovalsScreen from '../screens/admin/AdminApprovalsScreen';

// Appointment Screens
import AppointmentListScreen from '../screens/appointment/AppointmentListScreen';
import BookAppointmentScreen from '../screens/appointment/BookAppointmentScreen';
import AppointmentDetailScreen from '../screens/appointment/AppointmentDetailScreen';

// Payment Screens
import BookingPaymentScreen from '../screens/payment/BookingPaymentScreen';
import PaymentListScreen from '../screens/payment/PaymentListScreen';
import PaymentDetailScreen from '../screens/payment/PaymentDetailScreen';

// Medical Record Screens
import MedicalRecordListScreen from '../screens/medicalRecord/MedicalRecordListScreen';
import AddMedicalRecordScreen from '../screens/medicalRecord/AddMedicalRecordScreen';
import MedicalRecordDetailScreen from '../screens/medicalRecord/MedicalRecordDetailScreen';
import EditMedicalRecordScreen from '../screens/medicalRecord/EditMedicalRecordScreen';

// Prescription Screens
import PrescriptionListScreen from '../screens/prescription/PrescriptionListScreen';
import AddPrescriptionScreen from '../screens/prescription/AddPrescriptionScreen';
import PrescriptionDetailScreen from '../screens/prescription/PrescriptionDetailScreen';

// Profile
import ProfileScreen from '../screens/auth/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: {
    backgroundColor: '#4F46E5',
  },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: {
    fontWeight: '700',
    fontSize: 18,
  },
  animation: 'slide_from_right',
};

const HomeStack = () => {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {isDoctor ? (
        <Stack.Screen name="DoctorHome" component={DoctorHomeScreen} options={{ title: 'MediHelp Dashboard' }} />
      ) : user?.role === 'admin' ? (
        <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ title: 'Admin Dashboard' }} />
      ) : (
        <Stack.Screen name="DoctorList" component={DoctorListScreen} options={{ title: 'Doctors' }} />
      )}
      <Stack.Screen name="DoctorDetail" component={DoctorDetailScreen} options={{ title: 'Doctor Profile' }} />
      <Stack.Screen name="AddDoctor" component={AddDoctorScreen} options={{ title: 'Add Doctor' }} />
      <Stack.Screen name="EditDoctor" component={EditDoctorScreen} options={{ title: 'Edit Doctor' }} />
      <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} options={{ title: 'Book Appointment' }} />
      <Stack.Screen name="BookingPayment" component={BookingPaymentScreen} options={{ title: 'Payment' }} />
    </Stack.Navigator>
  );
};


// Appointments Stack
const AppointmentStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="AppointmentList" component={AppointmentListScreen} options={{ title: 'Appointments' }} />
    <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} options={{ title: 'Appointment Details' }} />
    <Stack.Screen name="BookAppointmentFromList" component={BookAppointmentScreen} options={{ title: 'Book Appointment' }} />
    <Stack.Screen name="BookingPayment" component={BookingPaymentScreen} options={{ title: 'Payment' }} />
  </Stack.Navigator>
);

// Records Stack
const RecordStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="MedicalRecordList" component={MedicalRecordListScreen} options={{ title: 'Medical Records' }} />
    <Stack.Screen name="AddMedicalRecord" component={AddMedicalRecordScreen} options={{ title: 'Add Record' }} />
    <Stack.Screen name="MedicalRecordDetail" component={MedicalRecordDetailScreen} options={{ title: 'Record Details' }} />
    <Stack.Screen name="EditMedicalRecord" component={EditMedicalRecordScreen} options={{ title: 'Edit Record' }} />
  </Stack.Navigator>
);

// Prescription Stack
const PrescriptionStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="PrescriptionList" component={PrescriptionListScreen} options={{ title: 'Prescriptions' }} />
    <Stack.Screen name="AddPrescription" component={AddPrescriptionScreen} options={{ title: 'Add Prescription' }} />
    <Stack.Screen name="PrescriptionDetail" component={PrescriptionDetailScreen} options={{ title: 'Prescription Details' }} />
  </Stack.Navigator>
);

// Payment Stack
const PaymentStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="PaymentList" component={PaymentListScreen} options={{ title: 'Payments' }} />
    <Stack.Screen name="PaymentDetail" component={PaymentDetailScreen} options={{ title: 'Payment Details' }} />
  </Stack.Navigator>
);

// Approvals Stack
const ApprovalStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="AdminApprovals" component={AdminApprovalsScreen} options={{ title: 'Doctor Verification' }} />
  </Stack.Navigator>
);

// Profile Stack
const ProfileStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
    <Stack.Screen name="EditDoctor" component={EditDoctorScreen} options={{ title: 'Edit Doctor' }} />
  </Stack.Navigator>
);

const MainStack = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Appointments':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Payments':
              iconName = focused ? 'card' : 'card-outline';
              break;
            case 'Records':
              iconName = focused ? 'document-text' : 'document-text-outline';
              break;
            case 'Approvals':
              iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
              break;
            case 'Prescriptions':
              iconName = focused ? 'medical' : 'medical-outline';
              break;
            case 'ProfileTab':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }

          return (
            <View style={focused ? styles.activeTab : null}>
              <Ionicons name={iconName} size={size} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Appointments" component={AppointmentStack} />
      <Tab.Screen name="Payments" component={PaymentStack} />
      <Tab.Screen name="Records" component={RecordStack} />
      {isAdmin && <Tab.Screen name="Approvals" component={ApprovalStack} />}
      {user?.role !== 'admin' && (
        <Tab.Screen name="Prescriptions" component={PrescriptionStack} />
      )}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  activeTab: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 4,
  },
});

export default MainStack;
