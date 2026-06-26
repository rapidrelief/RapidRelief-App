import React from "react";
import { StatusBar, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import SignUpF from "./SignUpF";

const SignUpScreen = () => {
  return (
    <LinearGradient 
      colors={['#0F172A', '#1E3A8A', '#1A4BCC']} 
      style={{ flex: 1 }}
    >
      <StatusBar 
        barStyle="light-content" 
        translucent 
        backgroundColor="transparent" 
      />
      
      <SafeAreaView 
        style={{ flex: 1 }} 
        edges={['top']}
      >
        <View style={{ flex: 1 }}>
          <SignUpF />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SignUpScreen;