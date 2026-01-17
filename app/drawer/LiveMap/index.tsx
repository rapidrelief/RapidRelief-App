import DashboardScreen from "@/app/screens/main/dashboard/DashboardScreen";
import MapScreen from "@/app/screens/main/livemap/MapScreen";
import React, { useState } from 'react';

export default function Page() {
  // Use state to manage which screen is visible
  const [activeTab, setActiveTab] = useState('Map');

  // This is the function MapScreen is looking for
  const handleNavigation = (screenName: string) => {
    setActiveTab(screenName);
  };

  return (
    <>
      {activeTab === 'Map' ? (
        <MapScreen onNavigate={handleNavigation} />
      ) : (
        <DashboardScreen /> 
      )}
    </>
  );
}