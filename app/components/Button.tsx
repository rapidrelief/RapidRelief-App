import React, { useMemo } from "react";
import { Text, TouchableOpacity, useWindowDimensions, StyleSheet } from "react-native";

interface ButtonProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ title, onPress, disabled }) => {
  const { width } = useWindowDimensions();

  // Memoize style calculations for performance
  const res = useMemo(() => ({
    width: width * 0.85,
    paddingVertical: width * 0.04,
    fontSize: width * 0.045,
  }), [width]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
      style={{
        width: res.width,
        paddingVertical: res.paddingVertical,
      }}
      className={`rounded-2xl border border-white mt-4 items-center justify-center ${
        disabled ? 'bg-white/10' : 'bg-white/20'
      }`}
    >
      <Text
        style={{ fontSize: res.fontSize }}
        className={`text-center font-semibold ${
          disabled ? 'text-white/30' : 'text-white'
        }`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// --- CLEAR EXPORT AT THE END ---
export default React.memo(Button);