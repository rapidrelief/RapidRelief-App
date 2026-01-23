import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';

const DangerZone = () => {
  
  // 1. Function to handle the actual API call later
  const performDeletion = async () => {
    try {
      // Step A: Call your Backend (Future)
      // await api.deleteAccount(); 
      
      // Step B: Clear local data
      // await AsyncStorage.clear();

      // Step C: Success Message
      Alert.alert("Deleted", "Your account has been successfully removed.");
      
      // Step D: Navigate to Auth Screen
      // navigation.replace('Login');
      
      console.log("Account wiped.");
    } catch (error) {
      Alert.alert("Error", "Could not delete account. Try again later.");
    }
  };

  const handleDeleteAccount = () => {
    // 2. The Professional "Double-Check" Alert
    Alert.alert(
      "Confirm Deletion", // Title
      "This will permanently delete your profile, emergency contacts, and history. You cannot undo this.", // Message
      [
        {
          text: "Cancel",
          style: "cancel", // Standard 'go back' styling
        },
        {
          text: "Delete Forever",
          onPress: performDeletion,
          style: "destructive", // Colors the text RED on iOS
        },
      ]
    );
  };

  return (
    <View className="bg-red-50 border border-red-100 rounded-[32px] p-6 mb-10 shadow-sm">
      <View className="flex-row items-center mb-4">
        <View className="bg-red-600 p-3 rounded-2xl">
          <Feather name="log-out" size={24} color="white" />
        </View>
        <Text className="ml-4 text-xl font-bold text-slate-900">Danger Zone</Text>
      </View>

      <Text className="text-slate-600 text-sm mb-8 leading-5">
        Once you delete your account, there is no going back. Please be certain.
      </Text>

      <TouchableOpacity 
        onPress={handleDeleteAccount}
        activeOpacity={0.8}
        className="bg-red-600 py-4 rounded-[20px] items-center shadow-md shadow-red-200"
      >
        <Text className="text-white font-medium text-lg">Delete Account</Text>
      </TouchableOpacity>
    </View>
  );
};

export default DangerZone;