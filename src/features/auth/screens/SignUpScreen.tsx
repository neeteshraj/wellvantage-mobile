import React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {t} from '../../../i18n';

const GoogleIcon = require('../../../assets/icons/google.png');
const ArrowBackIcon = require('../../../assets/icons/arrow-back.png');

export const SignUpScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleGoogleSignUp = () => {
    // TODO: Implement Google Sign Up
    console.log('Google Sign Up pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Image source={ArrowBackIcon} style={styles.backArrowIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('auth.signUp.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Welcome Text */}
        <Text style={styles.welcomeText}>{t('auth.signUp.welcome')}</Text>

        {/* Google Sign Up Button */}
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignUp}
          activeOpacity={0.7}>
          <Image source={GoogleIcon} style={styles.googleIcon} />
          <Text style={styles.googleButtonText}>
            {t('auth.signUp.continueWithGoogle')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backArrowIcon: {
    width: 24,
    height: 24,
    tintColor: '#333333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#333333',
    fontFamily: Platform.select({
      ios: 'Poppins-SemiBold',
      android: 'Poppins-SemiBold',
    }),
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 25,
    fontWeight: '400',
    color: '#333333',
    textAlign: 'center',
    lineHeight: 35,
    marginBottom: 48,
    fontFamily: Platform.select({
      ios: 'Poppins-SemiBold',
      android: 'Poppins-SemiBold',
    }),
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 300,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#333333',
    lineHeight: 24,
    fontFamily: Platform.select({
      ios: 'Poppins-Medium',
      android: 'Poppins-Medium',
    }),
  },
});

export default SignUpScreen;
