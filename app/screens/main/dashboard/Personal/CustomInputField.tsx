import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface InputProps {
  label: string;
  value: string;
  icon: any;
  required?: boolean;
  editable?: boolean; // New prop
}

const CustomInputField = ({ label, value, icon, required, editable }: InputProps) => (
  <View className="mb-5">
    <Text className="text-[#1E293B] font-bold text-sm mb-2 ml-1">
      {label} {required && <Text className="text-red-500">*</Text>}
    </Text>
    <View className={`flex-row items-center px-4 py-4 rounded-2xl border ${editable ? 'bg-white border-[#2563EB]' : 'bg-[#F8FAFC] border-[#F1F5F9]'}`}>
      <Feather name={icon} size={18} color={editable ? "#2563EB" : "#94A3B8"} />
      <TextInput 
        defaultValue={value} 
        editable={editable}
        className={`flex-1 ml-3 font-medium ${editable ? 'text-[#1E293B]' : 'text-[#64748B]'}`} 
      />
    </View>
  </View>
);

export default CustomInputField;