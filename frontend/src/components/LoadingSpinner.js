import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

const LoadingSpinner = ({ message = 'Loading...', size = 'large', color = '#4F46E5' }) => {
  return (
    <View style={styles.container}>
      <View style={styles.spinnerBox}>
        <ActivityIndicator size={size} color={color} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  spinnerBox: {
    padding: 30,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  message: {
    marginTop: 14,
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default LoadingSpinner;
