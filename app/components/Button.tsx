import React from "react";
import { Text, TouchableOpacity, useWindowDimensions } from "react-native";

interface ButtonProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ title, onPress, disabled }) => {
  const { width } = useWindowDimensions();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
      style={{
        width: width * 0.85, // Always 85% of screen width
        paddingVertical: width * 0.04, // Proportional padding
        // If you want a shadow without warnings, use the new boxShadow prop:
        // boxShadow: disabled ? 'none' : '0px 4px 6px rgba(0, 0, 0, 0.1)',
      }}
      className={`rounded-2xl border border-white mt-4 items-center justify-center ${
        disabled ? 'bg-white/10' : 'bg-white/20'
      }`}
    >
      <Text
        style={{ fontSize: width * 0.045 }} // Scaled text
        className={`text-center font-semibold ${
          disabled ? 'text-white/30' : 'text-white'
        }`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;