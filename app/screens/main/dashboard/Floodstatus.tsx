import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons, Ionicons, Octicons } from '@expo/vector-icons';

const Floodstatus = () => {
  return (
    <View className="bg-[#2563EB] rounded-[30px] p-6 mb-5 shadow-xl shadow-blue-400">
      
      {/* Header Row: Icon, Title, and Badge */}
      <View className="flex-row justify-between items-start mb-6">
        <View className="flex-row items-center">
          {/* Shield Icon with semi-transparent background */}
          <View className="bg-white/20 p-3 rounded-2xl">
            <MaterialCommunityIcons name="shield-outline" size={28} color="white" />
          </View>
          <View className="ml-4">
            <Text className="text-white font-bold text-xl leading-none">Flood Status</Text>
            <Text className="text-blue-100 text-sm mt-1">Current Alert Level</Text>
          </View>
        </View>

        {/* "SAFE" Badge */}
        <View className="bg-white/20 px-4 py-1.5 rounded-full">
          <Text className="text-white font-bold text-xs tracking-widest">SAFE</Text>
        </View>
      </View>

      {/* Info Section */}
      <View className="space-y-3 mb-5">
        {/* Status Check */}
        <View className="flex-row items-center">
          <Ionicons name="checkmark-circle-outline" size={22} color="white" />
          <Text className="text-white ml-3 text-[16px] font-medium">
            Your area is currently safe
          </Text>
        </View>

        {/* Location Info */}
        <View className="flex-row items-center mt-3">
          <Ionicons name="location-outline" size={22} color="white" />
          <Text className="text-white ml-3 text-[16px] font-medium">
            Gulberg III, Lahore
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View className="h-[1px] bg-white/20 w-full mb-4" />

      {/* Footer: Last Updated */}
      <View className="flex-row items-center">
        <Text className="text-blue-100 text-xs">
          Last updated: 2 minutes ago
        </Text>
      </View>
    </View>
  );
};

export default Floodstatus;