import React from 'react';
import { Alert, Platform } from 'react-native';
import Toast, { ToastType } from '@/components/Toast';

let toastCallback: ((message: string, type: ToastType) => void) | null = null;

export const setToastCallback = (callback: (message: string, type: ToastType) => void) => {
  toastCallback = callback;
};

export const showToast = {
  success: (message: string) => {
    if (Platform.OS === 'web' && toastCallback) {
      toastCallback(message, 'success');
    } else {
      console.log('✅', message);
    }
  },
  
  error: (message: string) => {
    if (Platform.OS === 'web' && toastCallback) {
      toastCallback(message, 'error');
    } else {
      console.log('❌', message);
    }
  },
  
  warning: (message: string) => {
    if (Platform.OS === 'web' && toastCallback) {
      toastCallback(message, 'warning');
    } else {
      console.log('⚠️', message);
    }
  },
  
  info: (message: string) => {
    if (Platform.OS === 'web' && toastCallback) {
      toastCallback(message, 'info');
    } else {
      console.log('ℹ️', message);
    }
  },
};

export const showAlert = (
  title: string,
  message: string,
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>
) => {
  Alert.alert(title, message, buttons);
};
