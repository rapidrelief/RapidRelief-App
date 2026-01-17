import React from "react";
import { View, Text, useWindowDimensions } from "react-native";
import Button from "./../../components/Button";

interface HomeButtonProps {
  onLogin?: () => void;
  onSignUp?: () => void;
}

const HomeButton: React.FC<HomeButtonProps> = ({ onLogin, onSignUp }) => {
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();

  // Calculate responsive spacing
  const bottomPadding = screenHeight * 0.05; // 5% of screen height
  const marginVertical = screenHeight * 0.02; // 2% of screen height
  const fontSize = screenWidth * 0.03; // ~12px on standard phones

  return (
    <View 
      className="flex-1 w-full bg-[#1A4BCC] items-center justify-end"
      style={{ paddingBottom: bottomPadding }}
    >
      {/* Login Button */}
      <View style={{ width: '100%', alignItems: 'center', marginBottom: marginVertical * 0.5 }}>
        <Button title="Login" onPress={onLogin} />
      </View>

      {/* Sign Up Button */}
      <View style={{ width: '100%', alignItems: 'center' }}>
        <Button title="Sign Up" onPress={onSignUp} />
      </View>

      {/* Terms & Privacy */}
      <Text 
        className="text-white/70 text-center"
        style={{ 
          marginTop: marginVertical * 1.5, 
          fontSize: fontSize,
          paddingHorizontal: screenWidth * 0.1 // Prevent text from hitting edges
        }}
      >
        By continuing, you agree to our{" "}
        <Text className="underline font-bold">Terms & Privacy Policy</Text>
      </Text>
    </View>
  );
};

export default HomeButton;