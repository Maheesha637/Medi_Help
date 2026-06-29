import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use appropriate base URL based on platform
const getBaseURL = () => {
  if (__DEV__) {
    // For development
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:4000/api'; // Android emulator
    }
    return 'http://localhost:4000/api'; // iOS simulator
  }
  // Production URL - update this after deploying to Render
  return 'https://medihelp-api.onrender.com/api';
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT from AsyncStorage
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from AsyncStorage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid - could trigger logout here
      console.log('Unauthorized - token may have expired');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
