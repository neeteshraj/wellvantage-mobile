// API Client configuration using Axios

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import {API} from '../../constants';
import {StorageService} from '../storage';

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
// Queue of requests waiting for token refresh
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

// Callback to notify AuthContext when tokens are invalid and user should be logged out
let onTokenRefreshFailure: (() => void) | null = null;

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

class ApiClient {
  private client: AxiosInstance;

  constructor(baseUrl: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: API.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = StorageService.getAuthToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error),
    );

    // Response interceptor for error handling and token refresh
    this.client.interceptors.response.use(
      response => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          // Skip refresh for auth endpoints
          if (
            originalRequest.url?.includes('/auth/refresh') ||
            originalRequest.url?.includes('/auth/google')
          ) {
            return Promise.reject(error);
          }

          if (isRefreshing) {
            // If already refreshing, queue this request
            return new Promise<string>((resolve, reject) => {
              failedQueue.push({resolve, reject});
            })
              .then(token => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.client(originalRequest);
              })
              .catch(err => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing = true;

          const refreshToken = StorageService.getRefreshToken();

          if (!refreshToken) {
            isRefreshing = false;
            processQueue(new Error('No refresh token available'), null);
            onTokenRefreshFailure?.();
            return Promise.reject(error);
          }

          try {
            // Call refresh endpoint - returns both new access and refresh tokens
            const response = await axios.post<{
              success: boolean;
              data: {accessToken: string; refreshToken: string};
            }>(`${baseUrl}/auth/refresh`, {refreshToken});

            const {accessToken: newAccessToken, refreshToken: newRefreshToken} =
              response.data.data;

            // Store new tokens (refresh token rotation)
            StorageService.setAuthToken(newAccessToken);
            StorageService.setRefreshToken(newRefreshToken);

            // Update default header
            this.client.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

            isRefreshing = false;
            processQueue(null, newAccessToken);

            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            isRefreshing = false;
            processQueue(
              refreshError instanceof Error
                ? refreshError
                : new Error('Token refresh failed'),
              null,
            );

            // Clear tokens and notify about auth failure
            StorageService.removeAuthToken();
            StorageService.removeRefreshToken();
            onTokenRefreshFailure?.();

            return Promise.reject(refreshError);
          }
        }

        // Handle other errors
        if (error.response?.data) {
          const data = error.response.data as {message?: string};
          throw new Error(data.message || 'Request failed');
        }
        throw error;
      },
    );
  }

  // Set callback for token refresh failure (used by AuthContext)
  setTokenRefreshFailureCallback(callback: (() => void) | null) {
    onTokenRefreshFailure = callback;
  }

  setAuthToken(token: string | null) {
    if (token) {
      this.client.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common.Authorization;
    }
  }

  async get<T>(endpoint: string, config?: AxiosRequestConfig) {
    const response = await this.client.get<T>(endpoint, config);
    return response.data;
  }

  async post<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig) {
    const response = await this.client.post<T>(endpoint, data, config);
    return response.data;
  }

  async put<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig) {
    const response = await this.client.put<T>(endpoint, data, config);
    return response.data;
  }

  async patch<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig) {
    const response = await this.client.patch<T>(endpoint, data, config);
    return response.data;
  }

  async delete<T>(endpoint: string, config?: AxiosRequestConfig) {
    const response = await this.client.delete<T>(endpoint, config);
    return response.data;
  }

  // Get the underlying axios instance for advanced use cases
  getInstance(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient(API.BASE_URL);
