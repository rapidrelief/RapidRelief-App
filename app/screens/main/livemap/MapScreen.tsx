import React, { memo } from "react";
import { ScrollView, View } from "react-native";
import Navbar from "../dashboard/Navbar";
// REMOVED: Sidebar import (now handled by _layout.tsx)

import MapCard from "./MapCard";
import MapHeader from "./MapHeader";
import MapLegend from "./MapLegend";

// FIXED: Made onNavigate optional (?) so TypeScript doesn't complain
const MapScreen = ({ onNavigate }: { onNavigate?: (name: string) => void }) => {
  
  // REMOVED: isMenuOpen state and handleToggleMenu. 
  // The global drawer manages its own open/close state.

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
      >
        <View className="px-5 w-full max-w-[600px] self-center">
          <MapHeader />
          <MapCard />
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