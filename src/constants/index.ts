// App-wide constants

import {API_BASE_URL} from '@env';

export const APP_NAME = 'Wellvantage';

// API Configuration
export const API = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@wellvantage/auth_token',
  REFRESH_TOKEN: '@wellvantage/refresh_token',
  USER_DATA: '@wellvantage/user_data',
  ONBOARDING_COMPLETE: '@wellvantage/onboarding_complete',
  THEME: '@wellvantage/theme',
} as const;

// Screen Names
export const SCREENS = {
  HOME: 'Home',
  LOGIN: 'Login',
  REGISTER: 'Register',
  PROFILE: 'Profile',
  SETTINGS: 'Settings',
} as const;

// Layout
export const LAYOUT = {
  PADDING: 16,
  MARGIN: 16,
  BORDER_RADIUS: 8,
} as const;
