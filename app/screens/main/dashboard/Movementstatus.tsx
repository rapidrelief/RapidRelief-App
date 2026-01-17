import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const MovementStatus = () => {
  return (
    <View className="bg-[#00A844] rounded-[30px] p-6 mb-5 shadow-xl shadow-green-200">
      
      {/* Header Row */}
      <View className="flex-row items-center mb-6">
        <View className="bg-white/20 p-3 rounded-2xl">
          <Ionicons name="checkmark-done-circle-outline" size={28} color="white" />
        </View>
        <View className="ml-4">
          <Text className="text-white font-bold text-xl leading-none">Movement Status</Text>
          <Text className="text-green-100 text-sm mt-1">Activity Monitoring</Text>
        </View>
      </View>

      {/* Inner Status Box */}
      <View className="bg-white/20 rounded-2xl p-5 mb-4 relative">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-white font-bold text-lg">You are safe</Text>
          {/* Small white indicator dot */}
          <View className="w-2 h-2 bg-white rounded-full shadow-sm" />
        </View>
        <Text className="text-green-50">
          Movement detected 3 minutes ago
        </Text>
      </View>

      {/* Bottom Disclaimer Text */}
      <Text className="text-green-50 text-[13px] leading-5">
        We'll alert your emergency contacts if no movement is detected for 15+ minutes
      </Text>
    </View>
  );
};

export default MovementStatus;