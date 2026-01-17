import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import Button from "../../components/Button";
import FormInput from "../../components/FormInput";

interface ResetProps {
  navigation: {
    goBack: () => void;
    navigate: (screen: string) => void;
  };
}

const Reset: React.FC<ResetProps> = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const { width, height } = useWindowDimensions();

  const canSendOTP = phoneNumber.trim().length >= 10;

  return (
    <View style={{ paddingHorizontal: width * 0.08, paddingBottom: height * 0.05 }}>
      {/* Back Button - Responsive Scaling */}
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          marginBottom: height * 0.02,
          marginTop: height * 0.01 
        }}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Ionicons name="arrow-back" size={width * 0.06} color="white" />
        <Text style={{ fontSize: width * 0.04, color: 'white', marginLeft: 8 }}>Back</Text>
      </TouchableOpacity>

      {/* Header Text */}
      <Text style={{ fontSize: width * 0.08, color: 'white', fontWeight: 'bold' }}>
        Reset Password
      </Text>
      <Text style={{ 
        fontSize: width * 0.038, 
        color: 'rgba(255,255,255,0.8)', 
        marginBottom: height * 0.03,
        marginTop: height * 0.01
      }}>
        Enter your phone number to receive OTP
      </Text>

      {/* Input Component - Now perfectly visible */}
      <FormInput
        label="Phone Number"
        placeholder="+92 300 1234567"
        iconName="call-outline"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />

      {/* Button */}
      <View style={{ alignItems: 'center', marginTop: height * 0.03 }}>
        <Button 
          title="Send OTP" 
          onPress={() => console.log("OTP Sent")} 
          disabled={!canSendOTP} 
        />
      </View>
    </View>
  );
};

export default Reset;