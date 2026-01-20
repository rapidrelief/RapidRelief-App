import React, { memo, useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import Navbar from "../dashboard/Navbar";
import Sidebar from "../dashboard/Sidebar";

// 1. Import your separate files exactly as they are named
import MapCard from "./MapCard";
import MapHeader from "./MapHeader";
import MapLegend from "./MapLegend";

const MapScreen = ({ onNavigate }: { onNavigate: (name: string) => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Use callback to prevent unnecessary re-renders of the Navbar
  const handleToggleMenu = useCallback((state: boolean) => {
    setIsMenuOpen(state);
  }, []);

  return (
    <View className="flex-1 bg-white">
      {/* Navbar stays sticky at the top */}
      <Navbar onMenuPress={() => handleToggleMenu(true)} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 110, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* responsiveness: max-w limits width on tablets, self-center keeps it middle */}
        <View className="px-5 w-full max-w-[600px] self-center">
          <MapHeader />

          <MapCard />

          <MapLegend />
        </View>
      </ScrollView>

      <Sidebar
        isOpen={isMenuOpen}
        onClose={() => handleToggleMenu(false)}
        onNavigate={onNavigate}
        currentScreen="Map"
      />
    </View>
  );
};

export default memo(MapScreen);
