import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { requestNotificationPermissions } from './src/services/notifications';

const App = () => {
  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <RootNavigator />
    </NavigationContainer>
  );
};

export default App;