// Client API service

import {apiClient} from '../api/client';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  sessionsTotal: number;
  sessionsUsed: number;
  sessionsRemaining: number;
  packageExpiryDate: string;
  isExpired: boolean;
  createdAt: string;
}

export interface CreateClientRequest {
  name: string;
  email: string;
  phone?: string;
  sessionsTotal: number;
  packageExpiryDate: string;
}

interface GetClientsResponse {
  clients: Client[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const clientService = {
  /**
   * Get all clients for the authenticated trainer
   */
  async getClients(): Promise<Client[]> {
    const response = await apiClient.get<ApiResponse<GetClientsResponse>>(
      '/clients',
    );
    return response.data.clients;
  },

  /**
   * Create a new client
   */
  async createClient(request: CreateClientRequest): Promise<Client> {
    const response = await apiClient.post<ApiResponse<Client>>(
      '/clients',
      request,
    );
    return response.data;
  },

  /**
   * Delete a client by ID
   */
  async deleteClient(clientId: string): Promise<void> {
    await apiClient.delete(`/clients/${clientId}`);
  },
};
