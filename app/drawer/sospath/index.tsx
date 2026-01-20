import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Correct Imports
import Navbar from "@/app/screens/main/dashboard/Navbar";
import Sidebar from "@/app/screens/main/dashboard/Sidebar";
import EmergencyScreen from "@/app/screens/main/sospage/SosEmergencyScreen";
import DashboardScreen from "@/app/screens/main/dashboard/DashboardScreen";

export default function SosPathIndex() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("SOS"); // Always start with SOS here

  const handleNavigation = (tabName: string) => {
    // This only switches views INSIDE the SOS path (e.g., SOS -> History)
    setActiveTab(tabName);
    setIsMenuOpen(false);
  };

  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-[#F8FAFC]">
        <Sidebar
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onNavigate={handleNavigation}
          currentScreen="SOS" // Keep this highlighted
        />
        <Navbar onMenuPress={() => setIsMenuOpen(true)} />

        <View className="flex-1">
          {/* Only render SOS content here */}
          <EmergencyScreen onNavigate={handleNavigation} />
        </View>
      </View>
    </SafeAreaProvider>
  );
}