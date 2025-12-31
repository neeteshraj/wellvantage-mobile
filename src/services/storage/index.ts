// Storage service using MMKV

import {createMMKV} from 'react-native-mmkv';
import {STORAGE_KEYS} from '../../constants';

const storage = createMMKV({id: 'wellvantage-storage'});

export const StorageService = {
  get<T>(key: string): T | null {
    try {
      const value = storage.getString(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting ${key} from storage:`, error);
      return null;
    }
  },

  set<T>(key: string, value: T): boolean {
    try {
      storage.set(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting ${key} in storage:`, error);
      return false;
    }
  },

  remove(key: string): boolean {
    try {
      return storage.remove(key);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
      return false;
    }
  },

  clear(): boolean {
    try {
      storage.clearAll();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  },

  // Convenience methods for auth tokens
  getAuthToken(): string | null {
    return this.get<string>(STORAGE_KEYS.AUTH_TOKEN);
  },

  setAuthToken(token: string): boolean {
    return this.set(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  removeAuthToken(): boolean {
    return this.remove(STORAGE_KEYS.AUTH_TOKEN);
  },

  getRefreshToken(): string | null {
    return this.get<string>(STORAGE_KEYS.REFRESH_TOKEN);
  },

  setRefreshToken(token: string): boolean {
    return this.set(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  removeRefreshToken(): boolean {
    return this.remove(STORAGE_KEYS.REFRESH_TOKEN);
  },
};
