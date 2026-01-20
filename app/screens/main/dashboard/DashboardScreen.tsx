import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Welcome from './Welcome'; 
import Floodstatus from './Floodstatus';
import MovementStatus from './Movementstatus';
import Emergency from './Emergency'; // Now contains the responsive SosButton
import UserLocation from './UserLocation';
import SafetyTips from './SafetyTips';
import MapScreen from '../livemap/MapScreen'; 
import AlertsScreen from '../Alert/AlertScreen';
import SettingsScreen from '../settings/SettingScreen';

const DashboardScreen = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');

  const handleNavigate = useCallback((name: string) => {
    setActiveTab(name);
    setIsMenuOpen(false);
  }, []);

  const ActiveView = useMemo(() => {
    switch (activeTab) {
      case 'Map': return <MapScreen onNavigate={handleNavigate} />;
      case 'Alerts': return <AlertsScreen onNavigate={handleNavigate} />;
      case 'Settings': return <SettingsScreen onNavigate={handleNavigate} />;
      default: return null;
    }
  }, [activeTab, handleNavigate]);

  if (ActiveView) return ActiveView;

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <Navbar onMenuPress={() => setIsMenuOpen(true)} />

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ 
          paddingTop: 110, // Clears Navbar
          paddingBottom: 40 
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* max-w-[500px] ensures it looks good on tablets/web while staying centered */}
        <View className="px-5 w-full max-w-[500px] self-center">
          <Welcome />
          <Floodstatus />
          <MovementStatus />
          
          {/* Responsive Emergency Card */}
          <Emergency />
          
          <UserLocation />
          <SafetyTips />
        </View>
      </ScrollView>

      <Sidebar 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onNavigate={handleNavigate}
        currentScreen={activeTab}
      />
    </View>
  );
};

export default DashboardScreen;