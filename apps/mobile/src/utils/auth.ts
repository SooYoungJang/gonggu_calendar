/**
 * Auth Token Management
 *
 * Manages the auth JWT token in secure storage for the mobile app.
 * Used by PostgREST client and admin API helpers.
 */
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Get the auth token from secure storage.
 * On web, falls back to localStorage.
 */
export async function getAuthToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return (typeof window !== 'undefined'
        ? window.localStorage?.getItem('gonggu.authToken')
        : null) as string | null;
    } catch {
      return null;
    }
  }

  try {
    return await SecureStore.getItemAsync('gonggu.authToken');
  } catch {
    return null;
  }
}

export async function setAuthToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      window.localStorage?.setItem('gonggu.authToken', token);
    } catch {
      // ignore
    }
    return;
  }

  try {
    await SecureStore.setItemAsync('gonggu.authToken', token);
  } catch {
    // ignore
  }
}

export async function clearAuthToken(): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      window.localStorage?.removeItem('gonggu.authToken');
    } catch {
      // ignore
    }
    return;
  }

  try {
    await SecureStore.deleteItemAsync('gonggu.authToken');
  } catch {
    // ignore
  }
}
