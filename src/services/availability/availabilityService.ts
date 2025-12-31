// Availability API service

import {apiClient} from '../api/client';

export interface AvailabilityBlock {
  id: string;
  trainerId: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface CreateAvailabilityRequest {
  date: string;
  startTime: string;
  endTime: string;
}

export interface CreateBatchAvailabilityRequest {
  dates: string[];
  startTime: string;
  endTime: string;
  sessionName?: string;
}

export interface CreateBatchAvailabilityResponse {
  availabilityBlocks: AvailabilityBlock[];
  sessionName?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const availabilityService = {
  /**
   * Create a single availability block
   * Note: trainerId is extracted from the JWT token on the server
   */
  async createAvailability(
    request: CreateAvailabilityRequest,
  ): Promise<AvailabilityBlock> {
    const response = await apiClient.post<ApiResponse<AvailabilityBlock>>(
      '/calendar/availability',
      request,
    );
    return response.data;
  },

  /**
   * Create multiple availability blocks at once
   * Note: trainerId is extracted from the JWT token on the server
   */
  async createBatchAvailability(
    request: CreateBatchAvailabilityRequest,
  ): Promise<CreateBatchAvailabilityResponse> {
    const response = await apiClient.post<
      ApiResponse<CreateBatchAvailabilityResponse>
    >('/calendar/availability/batch', request);
    return response.data;
  },

  /**
   * Get availability blocks for a specific date
   */
  async getAvailability(
    trainerId: string,
    date: string,
  ): Promise<AvailabilityBlock[]> {
    const response = await apiClient.get<ApiResponse<AvailabilityBlock[]>>(
      '/calendar/availability',
      {
        params: {trainerId, date},
      },
    );
    return response.data;
  },
};
