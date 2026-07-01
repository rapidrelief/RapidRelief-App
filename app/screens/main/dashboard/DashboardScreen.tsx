import React, { memo } from 'react';
import { View, ScrollView } from 'react-native';
import Navbar from './Navbar';
// NOTE: We no longer import Sidebar here because it's handled by _layout.tsx
import Welcome from './Welcome'; 
import PredictionCard from './PredictionCard';
import Floodstatus from './Floodstatus';
import MovementStatus from './Movementstatus';
import Emergency from './Emergency'; 
import UserLocation from './UserLocation';
import SafetyTips from './SafetyTips';

const DashboardScreen = () => {
  // We remove the manual useState for menu and tabs. 
  // Navigation is now handled by folder-based routing in Expo Router.

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Navbar UI is preserved. It now triggers the global Drawer. */}
      <Navbar />

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ 
          paddingTop: 110, 
          paddingBottom: 40 
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 w-full max-w-[500px] self-center">
          <Welcome />
          <PredictionCard />
          <Floodstatus />
          <MovementStatus />
          
          <Emergency />
          
          <UserLocation />
          <SafetyTips />
        </View>
      </ScrollView>

      {/* IMPORTANT: The <Sidebar /> tag is removed from here. 
        It is now rendered automatically by the Drawer in app/drawer/_layout.tsx.
        Leaving it here caused the 'routeNames of undefined' crash.
      */}
    </View>
  );
};

export default memo(DashboardScreen);