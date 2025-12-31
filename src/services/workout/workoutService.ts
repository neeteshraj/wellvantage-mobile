// Workout API service

import {apiClient} from '../api/client';

export interface Exercise {
  id?: string;
  name: string;
  sets: string;
  reps: string;
}

export interface WorkoutDay {
  id?: string;
  dayNumber: number;
  bodyPart: string;
  exercises: Exercise[];
}

export interface CreateWorkoutPlanRequest {
  name: string;
  days: WorkoutDay[];
  notes: string;
}

export interface WorkoutPlanResponse {
  id: string;
  trainerId: string;
  name: string;
  days: WorkoutDay[];
  notes: string;
  createdAt: string;
}

export interface WorkoutPlanListItem {
  id: string;
  name: string;
  totalDays: number;
  totalExercises: number;
  createdAt: string;
}

export interface ListWorkoutPlansResponse {
  workoutPlans: WorkoutPlanListItem[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const workoutService = {
  /**
   * Create a new workout plan
   * Note: trainerId is extracted from the JWT token on the server
   */
  async createWorkoutPlan(
    request: CreateWorkoutPlanRequest,
  ): Promise<WorkoutPlanResponse> {
    const response = await apiClient.post<ApiResponse<WorkoutPlanResponse>>(
      '/workout/plans',
      request,
    );
    return response.data;
  },

  /**
   * Get all workout plans for the authenticated user
   * Note: trainerId is extracted from the JWT token on the server
   */
  async getWorkoutPlans(): Promise<ListWorkoutPlansResponse> {
    const response = await apiClient.get<ApiResponse<ListWorkoutPlansResponse>>(
      '/workout/plans',
    );
    return response.data;
  },

  /**
   * Delete a workout plan
   * Note: trainerId is extracted from the JWT token on the server
   */
  async deleteWorkoutPlan(id: string): Promise<void> {
    await apiClient.delete(`/workout/plans/${id}`);
  },
};
