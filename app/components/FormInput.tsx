import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { KeyboardTypeOptions, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";

interface FormInputProps {
  label: string; placeholder: string; iconName: any; iconType?: "ion" | "material";
  secureTextEntry?: boolean; value?: string; onChangeText?: (text: string) => void;
  isPassword?: boolean; keyboardType?: KeyboardTypeOptions;
}

const FormInput: React.FC<FormInputProps> = ({
  label, placeholder, iconName, iconType = "ion", secureTextEntry = false, value, onChangeText, isPassword = false, keyboardType = "default",
}) => {
  const { width } = useWindowDimensions();
  const [showPassword, setShowPassword] = useState(false);
  const Icon = iconType === "material" ? MaterialIcons : Ionicons;

  return (
    <View style={{ marginBottom: width * 0.045, width: '100%' }}>
      <View className="flex-row items-center mb-2">
        <Icon name={iconName} size={width * 0.045} color="white" />
        <Text style={{ fontSize: width * 0.038 }} className="text-white ml-2 font-medium">{label}</Text>
      </View>
      <View className="flex-row items-center bg-[#eef2fb] rounded-xl px-4">
        <TextInput
          style={{ flex: 1, fontSize: width * 0.04, paddingVertical: width * 0.035, color: '#1f2937', backgroundColor: 'transparent' }}
          placeholder={placeholder} placeholderTextColor="#9ca3af"
          secureTextEntry={isPassword ? !showPassword : secureTextEntry}
          value={value} onChangeText={onChangeText} keyboardType={keyboardType}
          autoCapitalize="none" 
          autoComplete={isPassword ? "password" : "username"}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
            <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={width * 0.05} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormInput;