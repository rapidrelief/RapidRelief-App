import React from 'react'; // Removed useState
import { View, ScrollView, Text } from 'react-native';
import Navbar from '../dashboard/Navbar';
// Removed Sidebar import as it's now global in _layout.tsx
import ProfileInfo from './ProfileInfo';
import EmergencyContacts from './EmergencyContacts';
import DangerZone from './DangerZone';
import NotificationSettings from './NotificationSettings';
import PrivacySecurity from './PrivacySecurity';

// FIXED: Made onNavigate optional (?) to prevent the undefined error
const SettingsScreen = ({ onNavigate }: { onNavigate?: (name: string) => void }) => {
  
  return (
    <View className="flex-1 bg-white">
      {/* FIXED: Removed onMenuPress prop. 
         Your new Navbar uses useNavigation() to open the global Drawer.
      */}
      <Navbar /> 
      
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

        <View className="mt-8 mb-4 items-center">
          <Text className="text-slate-400 text-sm">Version 1.0.1 (OTA Test)</Text>
        </View>
      </ScrollView>

      {/* FIXED: Removed the local <Sidebar />. 
         The sidebar is now rendered by app/drawer/_layout.tsx. 
         Keeping this here causes the "Babel construct" and "duplicate key" errors.
      */}
    </View>
  );
};

export default SettingsScreen;