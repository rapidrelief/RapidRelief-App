import React from 'react';
import { Text, View } from 'react-native';

const MapLegend = () => (
  <View className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mt-6">
    <Text className="font-bold text-slate-800 mb-4 text-sm">Map Legend</Text>
    <View className="flex-row flex-wrap">
  {[
    { color: "bg-blue-600", label: "Your Location" },
    { color: "bg-green-600", label: "Safe Zone" },
    { color: "bg-red-600", label: "Flood Zone" },
    { color: "bg-orange-600", label: "SOS Zone" },
    { color: "bg-yellow-300", label: "Weak Signal" },
    { color: "bg-yellow-500", label: "Lost Zone" },
    { color: "bg-gray-500", label: "No Signal" },
  ].map((item, index) => (
    <View key={index} className="flex-row items-center w-1/2 mb-3">
      <View className={`w-4 h-4 rounded-full ${item.color} border-2 border-white shadow-sm mr-2`} />
      <Text className="text-slate-600 font-medium text-xs">
        {item.label}
      </Text>
    </View>
  ))}
</View>
  </View>
);

export default MapLegend;