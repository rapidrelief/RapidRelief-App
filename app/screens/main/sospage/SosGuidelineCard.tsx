import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

const SosGuidelineCard = () => {
  const guidelines = [
    "Ensure you are in a genuine emergency situation",
    "Your location will be shared with rescue teams",
    "Emergency contacts will be automatically notified",
    "Stay calm and wait for rescue team to arrive"
  ];

  return (
    <View className="bg-amber-50 p-6 rounded-[30px] border border-amber-100 mb-6">
      <View className="flex-row items-center mb-4">
        <View className="bg-amber-500 p-2.5 rounded-2xl mr-4">
          <Feather name="alert-triangle" size={24} color="white" />
        </View>
        <Text className="text-xl font-bold text-slate-800">
          Before You Send an SOS
        </Text>
      </View>

      <View className="space-y-3">
        {guidelines.map((text, index) => (
          <View key={index} className="flex-row items-start px-1">
            <View className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 mr-3" />
            <Text className="flex-1 text-slate-600 font-medium leading-5">
              {text}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default memo(SosGuidelineCard);