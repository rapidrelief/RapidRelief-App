import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

const StayInformed = () => {
  return (
    <View className="bg-blue-50 border border-blue-100 p-5 rounded-[30px] flex-row items-start mt-4">
      <View className="bg-blue-600 p-3 rounded-2xl mr-4">
        <Feather name="info" size={20} color="white" />
      </View>
      <View className="flex-1">
        <Text className="text-slate-900 font-bold text-lg mb-1">Stay Informed</Text>
        <Text className="text-slate-600 text-sm leading-5">
          Enable notifications to receive real-time alerts about flood warnings and weather updates.
        </Text>
      </View>
    </View>
  );
};

export default StayInformed;