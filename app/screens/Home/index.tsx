import { useRouter } from "expo-router";
import React from "react";
import { StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import Header from "./Header";
import HeroImage from "./HeroImage";
import HomeButton from "./HomeButton";
import WelcomeText from "./WelcomeText";

const HomeScreen = () => {
  const router = useRouter();

  return (
    <LinearGradient 
      colors={['#0F172A', '#1E3A8A', '#1A4BCC']} 
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View style={{ flex: 1, paddingVertical: 10 }}>
          
          {/* Header gets some top breathing room */}
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <Header />
          </View>

          {/* Hero image is the most flexible, can shrink on smaller screens */}
          <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
            <HeroImage />
          </View>

          {/* Welcome Text stays cleanly above the buttons */}
          <View style={{ justifyContent: 'center', marginBottom: 30 }}>
            <WelcomeText />
          </View>

          {/* Buttons take their natural height at the bottom */}
          <View style={{ paddingBottom: 10 }}>
            <HomeButton
              onLogin={() => router.push("/auth/Login")}
              onSignUp={() => router.push("/auth/SignUp")}
              onOfflineSos={() => router.push("/auth/OfflineSOS")}
            />
          </View>

        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default HomeScreen;
