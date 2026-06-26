import React from "react";
import { StatusBar, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Reset from "./Reset";

const ForgotPasswordScreen = () => {
  return (
    <LinearGradient 
      colors={['#0F172A', '#1E3A8A', '#1A4BCC']} 
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <Reset />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ForgotPasswordScreen;