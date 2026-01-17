import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Emergency = () => {
  return (
    <View className="bg-white border-2 border-red-50 rounded-[35px] p-8 mb-6 items-center shadow-sm">
      {/* Title & Subtitle */}
      <Text className="text-gray-900 text-2xl font-bold mb-2">
        Emergency Assistance
      </Text>
      <Text className="text-gray-500 text-center text-lg mb-8 px-4">
        Press the button below if you need immediate help
      </Text>

      {/* SOS Button Container (Outer Glow/Ring) */}
      <View className="bg-red-50 p-4 rounded-full mb-6">
        {/* Middle Ring */}
        <View className="bg-red-100 p-3 rounded-full">
          {/* Main SOS Button */}
          <TouchableOpacity 
            activeOpacity={0.8}
            className="bg-[#EF4444] w-48 h-48 rounded-full items-center justify-center shadow-2xl shadow-red-500"
            onLongPress={() => alert('Emergency SOS Sent!')}
            delayLongPress={3000}
          >
            <MaterialCommunityIcons name="phone-outline" size={32} color="white" />
            <Text className="text-white text-4xl font-black mt-2 tracking-tighter">
              SOS
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Interaction Instruction */}
      <Text className="text-gray-400 font-medium text-base">
        Hold for 3 seconds to send emergency alert
      </Text>
    </View>
  );
};

export default Emergency;