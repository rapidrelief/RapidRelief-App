import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const UserLocation = () => {
  return (
    <View className="bg-white border border-gray-100 rounded-[35px] p-6 mb-10 shadow-sm">
      
      {/* Header with View Map Button */}
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-gray-900 text-xl font-bold">Your Location</Text>
        
        <TouchableOpacity className="flex-row items-center border border-gray-200 px-3 py-1.5 rounded-xl">
          <Ionicons name="location-outline" size={18} color="#4B5563" />
          <Text className="ml-2 text-gray-600 font-semibold">View Map</Text>
        </TouchableOpacity>
      </View>

      {/* Map Placeholder Container */}
      <View className="bg-blue-50/50 rounded-[30px] p-8 items-center justify-center border border-blue-100">
        
        {/* Large Map Pin Icon */}
        <View className="mb-4">
          <MaterialCommunityIcons name="map-marker" size={60} color="#2563EB" />
        </View>

        <Text className="text-gray-800 text-lg font-bold mb-1">
          Interactive Map
        </Text>
        
        <Text className="text-gray-500 text-center mb-6">
          Gulberg III, Lahore, Pakistan
        </Text>

        {/* Live Location Badge */}
        <View className="bg-blue-600 flex-row items-center px-5 py-3 rounded-2xl shadow-md shadow-blue-300">
          <View className="w-2.5 h-2.5 bg-white rounded-full mr-3 animate-pulse" />
          <Text className="text-white font-bold">Live Location Active</Text>
        </View>

      </View>
    </View>
  );
};

export default UserLocation;