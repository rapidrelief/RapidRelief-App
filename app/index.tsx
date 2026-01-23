// app/index.tsx
import React from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import HomeScreen from './screens/Home'; // points to screens/Home/index.tsx

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <HomeScreen />
    </SafeAreaView>
  );
}
