import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {SignUpScreen} from '../features/auth';
import {AuthStackParamList} from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="SignUp">
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      {/* Add more auth screens here */}
      {/* <Stack.Screen name="Login" component={LoginScreen} /> */}
      {/* <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} /> */}
    </Stack.Navigator>
  );
};
