import React from 'react';
import { ScrollView, StatusBar, KeyboardAvoidingView, Platform, SafeAreaView, useWindowDimensions, View } from 'react-native';
import Header from '@/app/screens/Home/Header';
import HeroImage from '@/app/screens/Home/HeroImage';
import WelcomeText from '@/app/screens/Home/WelcomeText';
import LogF from './LoginF';

const LoginScreen = () => {
  const { height } = useWindowDimensions();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1A4BCC' }}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ 
            flexGrow: 1, 
            // INCREASED: This ensures the button is pushed above the nav bar
            paddingBottom: Platform.OS === 'android' ? 40 : 20 
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Header />
          <HeroImage />
          <WelcomeText title="Welcome Back" subtitle="Sign in to continue" />
          <LogF />
          
          {/* Optional: Extra spacer for very small screens */}
          <View style={{ height: 10 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;