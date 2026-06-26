import React, { useState } from "react";
import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TermsModal from "../../components/TermsModal";

interface AgreeCheckboxProps {
  agree: boolean;
  onToggle: () => void;
}

const AgreeCheckbox: React.FC<AgreeCheckboxProps> = ({ agree, onToggle }) => {
  const { width, height } = useWindowDimensions();
  const [showTerms, setShowTerms] = useState(false);

  // Responsive sizes based on screen width
  const checkboxSize = width * 0.055; // Scales proportionally
  const iconSize = width * 0.035;
  const fontSize = width * 0.032;

  return (
    <View 
      style={{ 
        marginTop: height * 0.01, 
        marginBottom: height * 0.03 
      }} 
      className="flex-row items-center"
    >
      <TouchableOpacity 
        onPress={onToggle} 
        activeOpacity={0.7}
      >
        <View 
          style={{ 
            width: checkboxSize, 
            height: checkboxSize, 
            borderRadius: 4, 
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
              color="#1A4BCC" 
            />
          )}
        </View>
      </TouchableOpacity>

      <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
        <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
          <Text style={{ color: 'white', fontSize: fontSize, lineHeight: fontSize * 1.4 }}>
            I agree to the{" "}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setShowTerms(true)} activeOpacity={0.7}>
          <Text style={{ color: 'white', fontSize: fontSize, lineHeight: fontSize * 1.4, fontWeight: 'bold', textDecorationLine: 'underline' }}>
            Terms and Conditions
          </Text>
        </TouchableOpacity>
      </View>

      <TermsModal visible={showTerms} onClose={() => setShowTerms(false)} />
    </View>
  );
};

export default AgreeCheckbox;