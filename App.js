import React from 'react';
import { TimerProvider } from './src/context/TimerContext';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <TimerProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </TimerProvider>
  );
}