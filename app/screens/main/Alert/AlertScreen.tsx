import React, { useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import Navbar from '../dashboard/Navbar';
import Sidebar from '../dashboard/Sidebar';
import AlertStats from './AlertStats';
import AlertItem from './AlertItem';
import StayInformed from './StayInformed';

const AlertsScreen = ({ onNavigate }: { onNavigate: (name: string) => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const alertsData = [
    { title: "Heavy Rainfall Warning", location: "Gulberg, Lahore", time: "5m ago", level: "High", description: "Heavy rainfall expected in the next 2 hours. Water level rising." },
    { title: "Flood Alert - Level 2", location: "Johar Town", time: "15m ago", level: "Medium", description: "Water level reached 75%. Stay alert and monitor updates." },
    { title: "All Clear Notice", location: "DHA Phase 5", time: "30m ago", level: "Low", description: "Water levels have receded. Area is now safe." },
  ];

  return (
    <View className="flex-1 bg-white">
      <Navbar onMenuPress={() => setIsMenuOpen(true)} />
      
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

      <Sidebar 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onNavigate={onNavigate}
        currentScreen="Alerts" 
      />
    </View>
  );
};

export default AlertsScreen;