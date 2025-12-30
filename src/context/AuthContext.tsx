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

  // Initialize auth state on app start
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Configure Google Sign-In
        configureGoogleSignIn();

        // Check for stored tokens
        const accessToken = await StorageService.getAuthToken();
        const storedUser = await StorageService.get<AuthUser>(
          STORAGE_KEYS.USER_DATA,
        );

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
  }, []);

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

      // Store tokens
      await StorageService.setAuthToken(response.accessToken);
      await StorageService.setRefreshToken(response.refreshToken);
      await StorageService.set(STORAGE_KEYS.USER_DATA, response.user);

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

      // Clear stored data
      await StorageService.removeAuthToken();
      await StorageService.removeRefreshToken();
      await StorageService.remove(STORAGE_KEYS.USER_DATA);

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
