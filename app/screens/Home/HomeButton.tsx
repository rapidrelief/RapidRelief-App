import React, { useState } from "react";
import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TermsModal from "../../components/TermsModal";

interface HomeButtonProps {
  onLogin?: () => void;
  onSignUp?: () => void;
  onOfflineSos?: () => void;
}

const HomeButton: React.FC<HomeButtonProps> = ({ onLogin, onSignUp, onOfflineSos }) => {
  const { width: screenWidth } = useWindowDimensions();
  const [showTerms, setShowTerms] = useState(false);

  return (
    <View className="w-full items-center px-6">
      
      {/* Primary Actions Container */}
      <View className="w-full space-y-4 mb-6">
        <TouchableOpacity 
          onPress={onSignUp}
          className="w-full bg-white py-4 rounded-2xl flex-row justify-center items-center shadow-lg"
          style={{ shadowColor: '#38bdf8', shadowOpacity: 0.3, shadowRadius: 10 }}
        >
          <Text className="text-blue-900 font-bold text-lg">Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onLogin}
          className="w-full bg-white/10 border border-white/20 py-4 rounded-2xl flex-row justify-center items-center mt-3"
        >
          <Text className="text-white font-semibold text-lg">Log In</Text>
        </TouchableOpacity>
      </View>

      {/* Subtle Offline SOS Button */}
      <TouchableOpacity 
        onPress={onOfflineSos}
        className="flex-row items-center justify-center bg-red-500/10 border border-red-500/30 py-2 px-6 rounded-full mb-6"
      >
        <Ionicons name="warning" size={16} color="#fca5a5" className="mr-2" />
        <Text className="text-red-200 font-medium ml-2 text-sm">Use Offline SOS</Text>
      </TouchableOpacity>

      {/* Terms & Privacy */}
      <View className="flex-row items-center justify-center flex-wrap px-4">
        <Text className="text-white/50 text-xs text-center">
          By continuing, you agree to our{" "}
        </Text>
        <TouchableOpacity onPress={() => setShowTerms(true)}>
          <Text className="underline font-medium text-white/70 text-xs">Terms & Privacy Policy</Text>
        </TouchableOpacity>
      </View>
      
      <TermsModal visible={showTerms} onClose={() => setShowTerms(false)} />
    </View>
  );
};

export default HomeButton;