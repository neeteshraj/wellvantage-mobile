// Google Sign-In service

import {GoogleSignin, statusCodes} from '@react-native-google-signin/google-signin';
import {GOOGLE_WEB_CLIENT_ID} from '@env';

/**
 * Configure Google Sign-In
 * Call this once when the app starts
 */
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
  });
};

/**
 * Sign in with Google and get ID token
 * @returns The Google ID token or null if sign-in was cancelled
 */
export const signInWithGoogle = async (): Promise<string | null> => {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();

    if (response.type === 'success' && response.data) {
      return response.data.idToken ?? null;
    }

    // User cancelled or other non-success response
    return null;
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error) {
      const googleError = error as {code: string};
      switch (googleError.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          // User cancelled the sign-in
          console.log('Google Sign-In cancelled by user');
          break;
        case statusCodes.IN_PROGRESS:
          // Sign-in already in progress
          console.log('Google Sign-In already in progress');
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          // Play services not available
          console.error('Google Play Services not available');
          break;
        default:
          console.error('Google Sign-In error:', error);
      }
    } else {
      console.error('Google Sign-In error:', error);
    }
    throw error;
  }
};

/**
 * Sign out from Google
 */
export const signOutFromGoogle = async (): Promise<void> => {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('Google Sign-Out error:', error);
  }
};

/**
 * Check if user is currently signed in with Google
 */
export const isGoogleSignedIn = async (): Promise<boolean> => {
  try {
    const response = await GoogleSignin.signInSilently();
    return response.type === 'success';
  } catch {
    return false;
  }
};
