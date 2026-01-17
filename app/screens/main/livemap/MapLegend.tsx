import React from 'react';
import { Text, View } from 'react-native';

const MapLegend = () => (
  <View className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mt-6">
    <Text className="font-bold text-slate-800 mb-4 text-sm">Map Legend</Text>
    <View className="flex-row items-center">
      <View className="flex-row items-center mr-8">
        <View className="w-3 h-3 rounded-full bg-blue-600 mr-2" />
        <Text className="text-slate-600 font-medium text-xs">Your Location</Text>
      </View>
      <View className="flex-row items-center">
        <View className="w-3 h-3 rounded-full bg-green-600 mr-2" />
        <Text className="text-slate-600 font-medium text-xs">Safe Zone</Text>
      </View>
    </View>
  </View>
);

export default MapLegend;