import AlertsScreen from "@/app/screens/main/Alert/AlertScreen";
import DashboardScreen from "@/app/screens/main/dashboard/DashboardScreen";
import React, { useState } from 'react';

export default function Page() {
  const [activeTab, setActiveTab] = useState('Alerts'); // Default to Alerts

  const handleNavigation = (screenName: string) => {
    setActiveTab(screenName);
  };

  return (
    <>
      {activeTab === 'Alerts' ? (
        <AlertsScreen onNavigate={handleNavigation} />
      ) : (
        /* If user clicks Dashboard in sidebar, it switches here */
        <DashboardScreen  />
      )}
    </>
  );
}