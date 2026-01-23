import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface InfoRowProps {
  icon: any;
  label: string;
  initialValue: string;
  storageKey: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}

const InfoRow = ({ icon, label, initialValue, storageKey, keyboardType = 'default' }: InfoRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);

  // Load saved data on mount
  useEffect(() => {
    const loadData = async () => {
      const savedValue = await AsyncStorage.getItem(storageKey);
      if (savedValue) setValue(savedValue);
    };
    loadData();
  }, []);

  const validate = () => {
    if (value.trim().length === 0) {
      Alert.alert("Error", `${label} cannot be empty`);
      return false;
    }
    if (keyboardType === 'phone-pad' && !/^\+?[0-9]{10,15}$/.test(value.replace(/\s/g, ''))) {
      Alert.alert("Invalid Number", "Please enter a valid phone number");
      return false;
    }
    if (keyboardType === 'email-address' && !/\S+@\S+\.\S+/.test(value)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (isEditing) {
      if (validate()) {
        await AsyncStorage.setItem(storageKey, value);
        setIsEditing(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  return (
    <View className="flex-row items-center justify-between py-3 border-b border-slate-50">
      <View className="flex-row items-center flex-1">
        <View className="bg-slate-50 p-2 rounded-lg">
          <Feather name={icon} size={18} color="#64748b" />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-xs text-slate-400">{label}</Text>
          {isEditing ? (
            <TextInput
              className="text-slate-800 font-medium p-0 m-0 border-b border-blue-200"
              value={value}
              onChangeText={setValue}
              autoFocus
              keyboardType={keyboardType}
            />
          ) : (
            <Text className="text-slate-800 font-medium" numberOfLines={1}>
              {value}
            </Text>
          )}
        </View>
      </View>
      
      <TouchableOpacity 
        onPress={handleSave}
        className={`border px-4 py-1.5 rounded-lg ${
          isEditing ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200'
        }`}
      >
        <Text className={`font-semibold text-xs ${isEditing ? 'text-white' : 'text-slate-600'}`}>
          {isEditing ? 'Save' : 'Edit'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const ProfileInfo = () => (
  <View className="bg-white border border-slate-100 rounded-[32px] p-5 mb-6 shadow-sm">
    <View className="flex-row items-center mb-4">
      <View className="bg-blue-100 p-3 rounded-2xl">
        <Feather name="user" size={20} color="#2563eb" />
      </View>
      <Text className="ml-3 text-lg font-bold text-slate-800">Profile Information</Text>
    </View>
    
    <InfoRow 
      icon="user" 
      label="Full Name" 
      initialValue="John Doe" 
      storageKey="@user_name" 
    />
    <InfoRow 
      icon="phone" 
      label="Phone Number" 
      initialValue="+92 300 1234567" 
      storageKey="@user_phone" 
      keyboardType="phone-pad" 
    />
    <InfoRow 
      icon="mail" 
      label="Email" 
      initialValue="john.doe@example.com" 
      storageKey="@user_email" 
      keyboardType="email-address" 
    />
    <InfoRow 
      icon="map-pin" 
      label="Location" 
      initialValue="Gulberg III, Lahore" 
      storageKey="@user_location" 
    />
  </View>
);

export default ProfileInfo;