import React, { useState, useMemo } from "react";
import { 
  View, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  SafeAreaView, 
  useWindowDimensions 
} from "react-native";
import Header from "@/app/screens/Home/Header";
import HeroImage from "@/app/screens/Home/HeroImage";
import Reset from "./Reset";
import VerifyOTP from "./VerifyOTP";
import NewPassword from "./NewPassword";
import { useRouter } from "expo-router";

const ForgotPasswordScreen = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const router = useRouter();
  const { height } = useWindowDimensions();

  // Clamped hero height: prevents it from getting too big on large screens
  const heroHeight = Math.min(height * 0.18, 150); 

  const renderStep = useMemo(() => {
    const commonProps = {
      phoneNumber,
      setPhoneNumber,
      onNext: () => setCurrentStep((p) => p + 1),
      onBack: () => setCurrentStep((p) => p - 1),
      navigation: { goBack: () => router.back() },
      onFinish: () => router.replace("/auth/Login")
    };

    switch (currentStep) {
      case 1: return <Reset {...commonProps} />;
      case 2: return <VerifyOTP {...commonProps} />;
      case 3: return <NewPassword {...commonProps} />;
      default: return null;
    }
  }, [currentStep, phoneNumber]);

  return (
    <SafeAreaView className="flex-1 bg-[#1A4BCC]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView 
          // flexGrow: 1 is crucial for responsive vertical distribution
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Header />
          
          <View style={{ height: heroHeight }} className="w-full justify-center items-center">
            <HeroImage />
          </View>
          
          {/* flex-1 here allows the renderStep to expand 
              and push the button to the bottom of the visible area 
          */}
          <View className="flex-1 w-full mt-2">
              {renderStep}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;