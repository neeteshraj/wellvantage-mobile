// Auth Context - manages authentication state across the app

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {AuthUser} from '../features/auth/types';
import {StorageService} from '../services/storage';
import {apiClient} from '../services/api/client';
import {
  authService,
  signInWithGoogle,
  signOutFromGoogle,
  configureGoogleSignIn,
} from '../services/auth';
import {STORAGE_KEYS} from '../constants';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle token refresh failure - sign out user
  const handleTokenRefreshFailure = useCallback(() => {
    console.log('Token refresh failed, signing out user');
    // Clear stored data (MMKV is synchronous)
    StorageService.removeAuthToken();
    StorageService.removeRefreshToken();
    StorageService.remove(STORAGE_KEYS.USER_DATA);

    // Clear API client token
    apiClient.setAuthToken(null);

    // Update state
    setUser(null);
    setError('Your session has expired. Please sign in again.');
  }, []);

  // Initialize auth state on app start
  useEffect(() => {
    const initAuth = () => {
      try {
        // Configure Google Sign-In
        configureGoogleSignIn();

        // Set up token refresh failure callback
        apiClient.setTokenRefreshFailureCallback(handleTokenRefreshFailure);

        // Check for stored tokens (MMKV is synchronous)
        const accessToken = StorageService.getAuthToken();
        const storedUser = StorageService.get<AuthUser>(STORAGE_KEYS.USER_DATA);

        if (accessToken && storedUser) {
          // Set the token in API client
          apiClient.setAuthToken(accessToken);
          setUser(storedUser);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Cleanup on unmount
    return () => {
      apiClient.setTokenRefreshFailureCallback(null);
    };
  }, [handleTokenRefreshFailure]);

  const handleSignInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get Google ID token
      const idToken = await signInWithGoogle();

      if (!idToken) {
        setIsLoading(false);
        return; // User cancelled or no token
      }

      // Exchange with backend
      const response = await authService.googleAuth(idToken);

      // Validate response
      if (!response?.accessToken || !response?.refreshToken || !response?.user) {
        console.error('Invalid auth response:', response);
        throw new Error('Invalid authentication response from server');
      }

      // Store tokens (MMKV is synchronous)
      StorageService.setAuthToken(response.accessToken);
      StorageService.setRefreshToken(response.refreshToken);
      StorageService.set(STORAGE_KEYS.USER_DATA, response.user);

      // Update API client
      apiClient.setAuthToken(response.accessToken);

      // Update state
      setUser(response.user);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to sign in with Google';
      setError(message);
      console.error('Google Sign-In error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    setIsLoading(true);

    try {
      // Sign out from Google
      await signOutFromGoogle();

      // Clear stored data (MMKV is synchronous)
      StorageService.removeAuthToken();
      StorageService.removeRefreshToken();
      StorageService.remove(STORAGE_KEYS.USER_DATA);

      // Clear API client token
      apiClient.setAuthToken(null);

      // Update state
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      error,
      signInWithGoogle: handleSignInWithGoogle,
      signOut: handleSignOut,
      clearError,
    }),
    [user, isLoading, error, handleSignInWithGoogle, handleSignOut, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
