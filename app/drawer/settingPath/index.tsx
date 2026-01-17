import React, { useState } from 'react';
import DashboardScreen from "@/app/screens/main/dashboard/DashboardScreen";
import SettingsScreen from "@/app/screens/main/settings/SettingScreen";

export default function Page() {
  // Default this specific hub to show Settings first
  const [activeTab, setActiveTab] = useState('Settings');

  const handleNavigation = (screenName: string) => {
    setActiveTab(screenName);
  };

  return (
    <>
      {activeTab === 'Settings' ? (
        <SettingsScreen onNavigate={handleNavigation} />
      ) : (
        /* Switches back to Dashboard components if selected in Sidebar */
        <DashboardScreen onNavigate={handleNavigation} />
      )}
    </>
  );
}