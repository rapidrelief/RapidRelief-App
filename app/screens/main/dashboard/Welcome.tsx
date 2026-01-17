import React from 'react';
import { View, Text } from 'react-native';

interface WelcomeProps {
  userName?: string; // Optional prop for when you have user data
}

const Welcome = ({ userName = "" }: WelcomeProps) => {
  return (
    <View className="mb-6">
      <Text className="text-[32px] font-bold text-gray-900 tracking-tight">
        Welcome Back{userName ? `, ${userName}` : '!' }
      </Text>
      <Text className="text-lg text-gray-500 font-medium mt-1">
        Stay safe and informed
      </Text>
    </View>
  );
};

export default Welcome;