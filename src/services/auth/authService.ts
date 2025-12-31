// Auth API service

import {apiClient} from '../api/client';
import {AuthUser} from '../../features/auth/types';

interface GoogleAuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const authService = {
  /**
   * Authenticate with Google ID token
   */
  async googleAuth(idToken: string): Promise<GoogleAuthResponse> {
    const response = await apiClient.post<ApiResponse<GoogleAuthResponse>>(
      '/auth/google',
      {idToken},
    );
    return response.data;
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>(
      '/auth/refresh',
      {refreshToken},
    );
    return response.data;
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<AuthUser> {
    const response = await apiClient.get<ApiResponse<AuthUser>>('/auth/me');
    return response.data;
  },
};
