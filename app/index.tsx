// app/index.tsx
import React from 'react';
import { View } from 'react-native';
import HomeScreen from './screens/Home'; 

export default function Index() {
  return (
    // Use the same blue as your design here to avoid any flicker
    <View className="flex-1 bg-[#2292EE]">
      <HomeScreen />
    </View>
  );
}