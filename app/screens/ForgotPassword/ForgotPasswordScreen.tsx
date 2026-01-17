import React from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, useWindowDimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Header from "@/app/screens/Home/Header";
import HeroImage from "@/app/screens/Home/HeroImage";
import Reset from "./Reset";

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const { height } = useWindowDimensions();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1A4BCC" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* By putting these INSIDE the ScrollView, they will slide up 
              when the keyboard opens, revealing the input field below */}
          <Header />
          <HeroImage />
          
          <View style={{ flex: 1 }}>
             <Reset navigation={navigation} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;