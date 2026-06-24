import React, { memo, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";
import Navbar from "../dashboard/Navbar";
// REMOVED: Sidebar import (now handled by _layout.tsx)

import MapCard from "./MapCard";
import MapHeader from "./MapHeader";
import MapLegend from "./MapLegend";

// FIXED: Made onNavigate optional (?) so TypeScript doesn't complain
const MapScreen = ({ onNavigate }: { onNavigate?: (name: string) => void }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  
  // REMOVED: isMenuOpen state and handleToggleMenu. 
  // The global drawer manages its own open/close state.

  const refreshMap = async () => {
    setRefreshing(true);
    setRefreshTick((value) => value + 1);
    setTimeout(() => setRefreshing(false), 700);
  };

  return (
    <View className="flex-1 bg-white">
      {/* FIXED: Removed onMenuPress prop. 
         Your updated Navbar now calls navigation.openDrawer() directly.
      */}
      <Navbar />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 110, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshMap} />
        }
      >
        <View className="px-5 w-full max-w-[600px] self-center">
          <MapHeader />

          {refreshing && (
            <View className="flex-row items-center justify-center bg-blue-50 border border-blue-100 rounded-2xl py-3 mb-4">
              <ActivityIndicator size="small" color="#2563EB" />
              <Text className="ml-2 text-blue-700 font-semibold">
                Refreshing map...
              </Text>
            </View>
          )}

          <MapCard refreshTick={refreshTick} />
          <MapLegend />
        </View>
      </ScrollView>

      {/* FIXED: Removed the local <Sidebar />. 
         If you keep this here, you get a "Babel construct" crash because 
         you have two sidebars fighting for control.
      */}
    </View>
  );
};

export default memo(MapScreen);
