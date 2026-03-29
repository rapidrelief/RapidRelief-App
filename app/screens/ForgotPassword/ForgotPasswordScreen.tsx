import React from "react";
import { SafeAreaView, StatusBar, KeyboardAvoidingView, Platform } from "react-native";
import Reset from "./Reset";

const ForgotPasswordScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1A4BCC" }}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Reset />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;