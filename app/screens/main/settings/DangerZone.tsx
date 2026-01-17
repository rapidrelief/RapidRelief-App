import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const DangerZone = () => {
  const handleDeleteAccount = () => {
    // Logic for account deletion (e.g., confirmation alert)
    console.log("Delete Account Pressed");
  };

  return (
    <View className="bg-red-50 border border-red-100 rounded-[32px] p-6 mb-10 shadow-sm">
      {/* Header with Icon */}
      <View className="flex-row items-center mb-4">
        <View className="bg-red-600 p-3 rounded-2xl">
          <Feather name="log-out" size={24} color="white" />
        </View>
        <Text className="ml-4 text-xl font-bold text-slate-900">Danger Zone</Text>
      </View>

      {/* Warning Text */}
      <Text className="text-slate-600 text-sm mb-8 leading-5">
        Once you delete your account, there is no going back. Please be certain.
      </Text>

      {/* Delete Button */}
      <TouchableOpacity 
        onPress={handleDeleteAccount}
        activeOpacity={0.8}
        className="bg-red-600 py-4 rounded-[20px] items-center shadow-md shadow-red-200"
      >
        <Text className="text-white font-bold text-lg">Delete Account</Text>
      </TouchableOpacity>
    </View>
  );
};

export default DangerZone;