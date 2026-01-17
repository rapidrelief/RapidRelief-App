import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Welcome from './Welcome'; 
import Floodstatus from './Floodstatus';
import MovementStatus from './Movementstatus';
import Emergency from './Emergency';
import UserLocation from './UserLocation';
import SafetyTips from './SafetyTips';
import MapScreen from '../livemap/MapScreen'; 
import AlertsScreen from '../Alert/AlertScreen'; // 1. Import AlertsScreen
import SettingsScreen from '../settings/SettingScreen';
const DashboardScreen = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');

  // Shared navigation handler
  const handleNavigate = (name: string) => setActiveTab(name);

  // 2. Logic for Map
  if (activeTab === 'Map') {
    return <MapScreen onNavigate={handleNavigate} />;
  }

  // 3. Logic for Alerts (same as Map)
  if (activeTab === 'Alerts') {
    return <AlertsScreen onNavigate={handleNavigate} />;
  }
  if (activeTab === 'Settings') {
    return <SettingsScreen onNavigate={handleNavigate} />;
  }

  return (
    <View className="flex-1 bg-white">
      <Navbar onMenuPress={() => setIsMenuOpen(true)} />

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingTop: 110, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5">
          <Welcome />
          <Floodstatus />
          <MovementStatus />
          <Emergency />
          <UserLocation />
          <SafetyTips />
        </View>
      </ScrollView>

      <Sidebar 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onNavigate={handleNavigate}
        currentScreen="Dashboard"
      />
    </View>
  );
};

export default DashboardScreen;