// Color palette for the app

export const COLORS = {
  // Primary colors
  primary: '#007AFF',
  primaryDark: '#0056B3',
  primaryLight: '#4DA3FF',

  // Secondary colors
  secondary: '#5856D6',
  secondaryDark: '#3634A3',
  secondaryLight: '#8886E5',

  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Semantic colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#5AC8FA',

  // Background colors
  background: {
    light: '#FFFFFF',
    dark: '#000000',
  },

  // Text colors
  text: {
    light: {
      primary: '#000000',
      secondary: '#6B7280',
      disabled: '#9CA3AF',
    },
    dark: {
      primary: '#FFFFFF',
      secondary: '#9CA3AF',
      disabled: '#6B7280',
    },
  },

  // Border colors
  border: {
    light: '#E5E7EB',
    dark: '#374151',
  },
} as const;
