import React from "react";
import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AgreeCheckboxProps {
  agree: boolean;
  onToggle: () => void;
}

const AgreeCheckbox: React.FC<AgreeCheckboxProps> = ({ agree, onToggle }) => {
  const { width, height } = useWindowDimensions();

  // Responsive sizes based on screen width
  const checkboxSize = width * 0.055; // Scales proportionally
  const iconSize = width * 0.035;
  const fontSize = width * 0.032;

  return (
    <TouchableOpacity 
      onPress={onToggle} 
      activeOpacity={0.7}
      style={{ 
        marginTop: height * 0.01, 
        marginBottom: height * 0.03 
      }} 
      className="flex-row items-center"
    >
      <View 
        style={{ 
          width: checkboxSize, 
          height: checkboxSize, 
          borderRadius: 4, // Keeps consistent corner rounding
          borderWidth: 1.5,
          borderColor: 'white',
          marginRight: width * 0.03,
          backgroundColor: agree ? 'white' : 'transparent'
        }} 
        className="items-center justify-center"
      >
        {agree && (
          <Ionicons 
            name="checkmark" 
            size={iconSize} 
            color="#1A4BCC" // Matching your theme color
          />
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text 
          style={{ fontSize: fontSize }} 
          className="text-white/90 leading-tight"
        >
          I agree to the <Text className="font-bold underline">Terms of Service</Text> and <Text className="font-bold underline">Privacy Policy</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default AgreeCheckbox;