/**
 * Wellvantage - Main App Component
 */

import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BootSplash from 'react-native-bootsplash';

import { ErrorBoundary } from './components';
import { AuthProvider } from './context/AuthContext';
import { RootNavigator } from './navigation';

/**
 * @function Root
 * @description The root component of the Wellvantage mobile application.
 * It sets up the gesture handler, safe area context, authentication context,
 * and the main navigation container.
 * @returns {React.JSX.Element} The root component.
 * @author @neeteshraj
 */

const Root = (): React.JSX.Element => {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    BootSplash.hide({ fade: true });
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Root;
