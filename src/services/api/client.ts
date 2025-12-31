// API Client configuration using Axios

import axios, {AxiosInstance, AxiosRequestConfig, AxiosError} from 'axios';
import {API} from '../../constants';

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

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        if (error.response?.data) {
          const data = error.response.data as {message?: string};
          throw new Error(data.message || 'Request failed');
        }
        throw error;
      },
    );
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
