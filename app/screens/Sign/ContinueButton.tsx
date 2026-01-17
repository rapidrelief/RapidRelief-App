import React from "react";
import { TouchableOpacity, Text } from "react-native";

interface ContinueButtonProps {
  disabled?: boolean;
  onPress?: () => void;
}

const ContinueButton: React.FC<ContinueButtonProps> = ({ disabled, onPress }) => {
  return (
    <TouchableOpacity 
      className={`py-4 rounded-2xl ${disabled ? 'bg-white/5' : 'bg-white/20'}`}
      disabled={disabled}
      onPress={onPress}
    >
      <Text className={`text-center font-bold text-lg ${disabled ? 'text-white/30' : 'text-white'}`}>
        Continue
      </Text>
    </TouchableOpacity>
  );
};

export default ContinueButton;
