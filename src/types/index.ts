// Global type definitions

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  // Add more screens as needed
};

// Common types
export interface User {
  id: string;
  email: string;
  name: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  totalPages: number;
  totalItems: number;
}

// Error types
export interface AppError {
  code: string;
  message: string;
}
