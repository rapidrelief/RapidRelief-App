import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useState, useMemo } from "react";
import { 
  KeyboardTypeOptions, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  useWindowDimensions, 
  View 
} from "react-native";

interface FormInputProps {
  label: string; 
  placeholder: string; 
  iconName: any; 
  iconType?: "ion" | "material";
  secureTextEntry?: boolean; 
  value?: string; 
  onChangeText?: (text: string) => void;
  isPassword?: boolean; 
  keyboardType?: KeyboardTypeOptions;
  editable?: boolean;
  maxLength?: number; // Added to fix your error
}

const FormInput: React.FC<FormInputProps> = ({
  label, 
  placeholder, 
  iconName, 
  iconType = "ion", 
  secureTextEntry = false, 
  value, 
  onChangeText, 
  isPassword = false, 
  keyboardType = "default",
  editable = true,
  maxLength,
}) => {
  const { width } = useWindowDimensions();
  const [showPassword, setShowPassword] = useState(false);
  
  const Icon = useMemo(() => 
    iconType === "material" ? MaterialIcons : Ionicons, 
  [iconType]);

  const styles = useMemo(() => ({
    containerMargin: width * 0.045,
    labelIconSize: width * 0.045,
    labelTextSize: width * 0.038,
    inputFontSize: width * 0.04,
    inputPadding: width * 0.035,
    eyeIconSize: width * 0.05,
  }), [width]);

  return (
    <View style={{ marginBottom: styles.containerMargin, width: '100%' }}>
      <View className="flex-row items-center mb-2">
        <Icon name={iconName} size={styles.labelIconSize} color="white" />
        <Text style={{ fontSize: styles.labelTextSize }} className="text-white ml-2 font-medium">
          {label}
        </Text>
      </View>

      <View 
        style={{ opacity: editable ? 1 : 0.6 }} 
        className="flex-row items-center bg-[#eef2fb] rounded-xl px-4"
      >
        <TextInput
          style={{ 
            flex: 1, 
            fontSize: styles.inputFontSize, 
            paddingVertical: styles.inputPadding, 
            color: '#1f2937', 
          }}
          placeholder={placeholder} 
          placeholderTextColor="#9ca3af"
          secureTextEntry={isPassword ? !showPassword : secureTextEntry}
          value={value} 
          onChangeText={onChangeText} 
          keyboardType={keyboardType}
          autoCapitalize="none" 
          editable={editable}
          maxLength={maxLength}
        />
        
        {isPassword && (
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            className="p-1"
          >
            <Ionicons 
              name={showPassword ? "eye-outline" : "eye-off-outline"} 
              size={styles.eyeIconSize} 
              color="#9ca3af" 
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default React.memo(FormInput);