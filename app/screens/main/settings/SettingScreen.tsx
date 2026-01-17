import React, { useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import Navbar from '../dashboard/Navbar';
import Sidebar from '../dashboard/Sidebar';
import ProfileInfo from './ProfileInfo';
import EmergencyContacts from './EmergencyContacts';
import DangerZone from './DangerZone';
import NotificationSettings from './NotificationSettings';
import PrivacySecurity from './PrivacySecurity';
const SettingsScreen = ({ onNavigate }: { onNavigate: (name: string) => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <View className="flex-1 bg-white">
      <Navbar onMenuPress={() => setIsMenuOpen(true)} />
      
      <ScrollView 
        className="flex-1 px-5" 
        contentContainerStyle={{ paddingTop: 110, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-3xl font-bold text-slate-900">Settings</Text>
        <Text className="text-slate-500 mb-6">Manage your account and preferences</Text>

        <ProfileInfo />
        <NotificationSettings />
        <PrivacySecurity />
        <EmergencyContacts />
        <DangerZone />
      </ScrollView>

      <Sidebar 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onNavigate={onNavigate}
        currentScreen="Settings" 
      />
    </View>
  );
};

export default SettingsScreen;