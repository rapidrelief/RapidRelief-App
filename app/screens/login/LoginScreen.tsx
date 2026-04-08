import React from 'react';
import { ScrollView, StatusBar, KeyboardAvoidingView, Platform, SafeAreaView, useWindowDimensions, View } from 'react-native';
import Header from '@/app/screens/Home/Header';
import HeroImage from '@/app/screens/Home/HeroImage';
import WelcomeText from '@/app/screens/Home/WelcomeText';
import LogF from './LoginF';
// 1. Import your BackButton
import BackButton from '@/app/components/BackButton'; 

const LoginScreen = () => {
  const { height } = useWindowDimensions();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1A4BCC' }}>
      <StatusBar barStyle="light-content" />
      
      {/* 2. Place it here. Because it is absolute, it stays on top. */}
      {/* <BackButton /> */}

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ 
            flexGrow: 1, 
            paddingBottom: Platform.OS === 'android' ? 40 : 20 
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Header />
          <View style={{ alignItems: 'center', marginBottom: -30, zIndex: 10 }}>
  <HeroImage />
</View>
          <WelcomeText title="Welcome Back" subtitle="Sign in to continue" />
          <LogF />
          
          <View style={{ height: 10 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;