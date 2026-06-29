import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import PatientRegisterScreen from '../screens/auth/PatientRegisterScreen';
import DoctorRegisterScreen from '../screens/auth/DoctorRegisterScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F3F4F6' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="PatientRegister" component={PatientRegisterScreen} />
      <Stack.Screen name="DoctorRegister" component={DoctorRegisterScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
