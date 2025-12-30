// Storage service using AsyncStorage

import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../../constants';

export const StorageService = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting ${key} from storage:`, error);
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting ${key} in storage:`, error);
      return false;
    }
  },

  async remove(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
      return false;
    }
  },

  async clear(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  },

  // Convenience methods for auth tokens
  async getAuthToken(): Promise<string | null> {
    return this.get<string>(STORAGE_KEYS.AUTH_TOKEN);
  },

  async setAuthToken(token: string): Promise<boolean> {
    return this.set(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  async removeAuthToken(): Promise<boolean> {
    return this.remove(STORAGE_KEYS.AUTH_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return this.get<string>(STORAGE_KEYS.REFRESH_TOKEN);
  },

  async setRefreshToken(token: string): Promise<boolean> {
    return this.set(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  async removeRefreshToken(): Promise<boolean> {
    return this.remove(STORAGE_KEYS.REFRESH_TOKEN);
  },
};
