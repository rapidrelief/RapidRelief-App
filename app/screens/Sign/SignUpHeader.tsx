import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View, useWindowDimensions } from "react-native";

interface SignUpHeaderProps {
  onClose?: () => void;
  title?: string;
  subtitle?: string;
}

const SignUpHeader: React.FC<SignUpHeaderProps> = ({ 
  onClose, 
  title = "Create Account", 
  subtitle = "Join Rapid Relief today" 
}) => {
  const { width, height } = useWindowDimensions();

  return (
    <View 
      style={{ 
        paddingHorizontal: width * 0.06, 
        paddingTop: height * 0.02,     // Your original exact spacing
        marginBottom: height * 0.02    // Your original exact spacing
      }} 
      className="flex-row justify-between items-start"
    >
      <View className="flex-1 mr-4"> 
        <Text 
          style={{ fontSize: width * 0.08 }} // Responsive Font (scales with width)
          className="text-white font-bold leading-tight"
        >
          {title}
        </Text>
        
        <Text 
          style={{ fontSize: width * 0.04 }} // Responsive Font (scales with width)
          className="text-white/80 mt-1"
        >
          {subtitle}
        </Text>
      </View>

      {onClose && (
        <TouchableOpacity 
          onPress={onClose}
          // Ensures the tap area is large enough even if the icon looks small
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          activeOpacity={0.6}
          style={{ marginTop: width * 0.01 }} // Keeps icon aligned with the text top
        >
          <Ionicons 
            name="close" 
            size={width * 0.075} // Responsive Icon (scales with width)
            color="white" 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SignUpHeader;