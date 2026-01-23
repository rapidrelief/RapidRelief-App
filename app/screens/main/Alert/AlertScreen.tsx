import React from 'react'; // Removed useState
import { View, ScrollView, Text } from 'react-native';
import Navbar from '../dashboard/Navbar';
// Removed Sidebar import - it's now handled by the drawer layout
import AlertStats from './AlertStats';
import AlertItem from './AlertItem';
import StayInformed from './StayInformed';

// FIXED: Made onNavigate optional (?) to prevent TypeScript errors 
// when called from your simplified app/drawer/AlertPath/index.tsx
const AlertsScreen = ({ onNavigate }: { onNavigate?: (name: string) => void }) => {
  
  // REMOVED: isMenuOpen state. 
  // The global drawer in _layout.tsx handles its own state.

  const alertsData = [
    { title: "Heavy Rainfall Warning", location: "Gulberg, Lahore", time: "5m ago", level: "High", description: "Heavy rainfall expected in the next 2 hours. Water level rising." },
    { title: "Flood Alert - Level 2", location: "Johar Town", time: "15m ago", level: "Medium", description: "Water level reached 75%. Stay alert and monitor updates." },
    { title: "All Clear Notice", location: "DHA Phase 5", time: "30m ago", level: "Low", description: "Water levels have receded. Area is now safe." },
  ];

  return (
    <View className="flex-1 bg-white">
      {/* FIXED: Removed onMenuPress. 
          Your new Navbar uses useNavigation() to open the drawer. 
      */}
      <Navbar /> 
      
      <ScrollView 
        className="flex-1 px-5" 
        contentContainerStyle={{ paddingTop: 110, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-slate-900">Emergency Alerts</Text>
        <Text className="text-slate-500 mb-6">Stay informed about flood warnings and safety updates</Text>

        <AlertStats />

        {alertsData.map((alert, index) => (
          <AlertItem key={index} {...alert} />
        ))}

        <StayInformed />
      </ScrollView>

      {/* FIXED: Removed the local <Sidebar /> component. 
          The Sidebar is now rendered once by app/drawer/_layout.tsx.
      */}
    </View>
  );
};

export default AlertsScreen;