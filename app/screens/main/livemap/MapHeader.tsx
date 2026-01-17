import React from 'react';
import { Text, View } from 'react-native';

const MapHeader = () => (
  <View className="mb-6">
    <Text className="text-2xl font-bold text-slate-900">Live Map</Text>
    <Text className="text-slate-500 mt-1">Track your location and nearby safe zones</Text>
  </View>
);

export default MapHeader;