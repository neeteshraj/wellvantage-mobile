// App configuration

export const config = {
  // App Info
  appName: 'Wellvantage',
  version: '1.0.0',

  // Feature Flags
  features: {
    enableAnalytics: !__DEV__,
    enableCrashReporting: !__DEV__,
    enablePushNotifications: true,
  },

  // Environment
  isDev: __DEV__,
  isProd: !__DEV__,
} as const;
