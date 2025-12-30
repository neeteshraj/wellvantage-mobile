// Storage service using AsyncStorage
// Note: Install @react-native-async-storage/async-storage before using

import {STORAGE_KEYS} from '../../constants';

// Placeholder type - replace with AsyncStorage when installed
type StorageType = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
};

// You'll need to install and import AsyncStorage:
// import AsyncStorage from '@react-native-async-storage/async-storage';
// Then replace this with: const storage: StorageType = AsyncStorage;
let storage: StorageType | null = null;

export const initStorage = (storageImpl: StorageType) => {
  storage = storageImpl;
};

const getStorage = (): StorageType => {
  if (!storage) {
    throw new Error('Storage not initialized. Call initStorage first.');
  }
  return storage;
};

export const StorageService = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await getStorage().getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting ${key} from storage:`, error);
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<boolean> {
    try {
      await getStorage().setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting ${key} in storage:`, error);
      return false;
    }
  },

  async remove(key: string): Promise<boolean> {
    try {
      await getStorage().removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
      return false;
    }
  },

  async clear(): Promise<boolean> {
    try {
      await getStorage().clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  },

  // Convenience methods for common operations
  async getAuthToken(): Promise<string | null> {
    return this.get<string>(STORAGE_KEYS.AUTH_TOKEN);
  },

  async setAuthToken(token: string): Promise<boolean> {
    return this.set(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  async removeAuthToken(): Promise<boolean> {
    return this.remove(STORAGE_KEYS.AUTH_TOKEN);
  },
};
