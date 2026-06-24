import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StatusBar,
  View,
  useWindowDimensions
} from "react-native";

import Header from "./Header";
import HeroImage from "./HeroImage";
import HomeButton from "./HomeButton";
import WelcomeText from "./WelcomeText";

const HomeScreen = () => {
  const { height: screenHeight } = useWindowDimensions();
  const router = useRouter();

  return (
    // The background color here fills the whole screen
    <View style={{ flex: 1, backgroundColor: "#1A4BCC" }}>
      <StatusBar
        barStyle="light-content" // White icons for blue background
        translucent={true} // Bleeds background into status bar
        backgroundColor="transparent"
      />

      <ScrollView
        contentContainerStyle={{ height: screenHeight }}
        bounces={false}
        scrollEnabled={false}
      >
        {/* Your percentage-based layout remains exactly as is */}
        <View style={{ height: screenHeight * 0.3 }}>
          <Header />
        </View>

        <View style={{ height: screenHeight * 0.2 }}>
          <HeroImage />
        </View>

        <View style={{ height: screenHeight * 0.15 }}>
          <WelcomeText />
        </View>

        <View style={{ height: screenHeight * 0.35 }}>
          <HomeButton
            onLogin={() => router.push("/auth/Login")}
            onSignUp={() => router.push("/auth/SignUp")}
            onOfflineSos={() => router.push("/auth/OfflineSOS")}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
