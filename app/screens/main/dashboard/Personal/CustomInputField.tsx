import React, { useMemo } from 'react';
import { View, Text, TextInput, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface InputProps {
  label: string;
  value: string;
  icon: any;
  required?: boolean;
  editable?: boolean;
  onChangeText?: (text: string) => void;
  loading?: boolean;
  error?: boolean;
  errorMessage?: string;
  keyboardType?: "default" | "numeric" | "phone-pad";
}

const CustomInputField = ({ label, value, icon, required, editable, onChangeText, loading, error, errorMessage, keyboardType = "default",}: InputProps) => {
  const { width } = useWindowDimensions();

  const res = useMemo(() => ({
    labelSize: Math.min(width * 0.035, 14),
    inputText: Math.min(width * 0.038, 15),
    paddingY: width * 0.04,
  }), [width]);

  return (
    <View className="mb-5">
      <Text style={{ fontSize: res.labelSize }} className="text-[#1E293B] font-bold mb-2 ml-1">
        {label} {required && <Text className="text-red-500">*</Text>}
      </Text>
      <View 
        style={{ paddingVertical: res.paddingY }}
        className={`flex-row items-center px-4 rounded-2xl border ${
          error
          ? 'bg-red-50 border-red-500'
          : editable 
          ? 'bg-white border-[#2563EB]' 
          : 'bg-[#F8FAFC] border-[#F1F5F9]'
        }`}
      >
        <Feather name={icon} size={18} color={editable ? "#2563EB" : "#94A3B8"} />
        <TextInput 
          defaultValue={loading ? "Loading..." : value} 
          editable={!loading && editable}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          style={{ fontSize: res.inputText }}
          className={`flex-1 ml-3 font-medium ${editable ? 'text-[#1E293B]' : 'text-[#64748B]'}`} 
        />
      </View>
      {error && errorMessage ? (
            <Text className="text-red-500 text-xs mt-2 ml-1">
              {errorMessage}
            </Text>
          ) : null}
    </View>
  );
};

export default React.memo(CustomInputField);