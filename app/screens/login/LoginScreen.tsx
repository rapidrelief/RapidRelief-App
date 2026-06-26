import React from 'react';
import { ScrollView, StatusBar, KeyboardAvoidingView, Platform, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '@/app/screens/Home/Header';
import WelcomeText from '@/app/screens/Home/WelcomeText';
import LogF from './LoginF';

const LoginScreen = () => {
  return (
    <LinearGradient 
      colors={['#0F172A', '#1E3A8A', '#1A4BCC']} 
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView 
            className="flex-1" 
            contentContainerStyle={{ 
              flexGrow: 1, 
              justifyContent: 'center',
              paddingBottom: 40 
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <View style={{ marginBottom: 20 }}>
              <Header />
            </View>
            
            <View style={{ marginBottom: 30 }}>
              <WelcomeText title="Welcome Back" subtitle="Sign in to continue" />
            </View>

            <LogF />
            
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default LoginScreen;