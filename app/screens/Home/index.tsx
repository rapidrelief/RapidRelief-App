import React from "react";
import { ScrollView, StatusBar, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router"; // Add this import
import Header from "./Header";
import HeroImage from "./HeroImage";
import HomeButton from "./HomeButton";
import WelcomeText from "./WelcomeText";

const HomeScreen = () => {
  const { height: screenHeight } = useWindowDimensions();
  const router = useRouter(); // Initialize router

  return (
    <View style={{ flex: 1, backgroundColor: "#1A4BCC" }}>
      <StatusBar barStyle="light-content" />
      <ScrollView 
        contentContainerStyle={{ height: screenHeight }} 
        bounces={false}
        scrollEnabled={false} 
      >
        <View style={{ height: screenHeight * 0.30 }}>
          <Header />
        </View>

        <View style={{ height: screenHeight * 0.20 }}>
          <HeroImage />
        </View>

        <View style={{ height: screenHeight * 0.15 }}>
          <WelcomeText />
        </View>

        <View style={{ height: screenHeight * 0.35 }}>
          {/* FIX: Pass the navigation functions here */}
          <HomeButton 
            onLogin={() => router.push("/auth/Login")} 
            onSignUp={() => router.push("/auth/SignUp")} 
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;