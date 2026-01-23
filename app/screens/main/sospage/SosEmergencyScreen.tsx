import React from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import Navbar from '../dashboard/Navbar'; 
import EmergencyHeader from './EmergencyHeader';
import SosGuidelineCard from './SosGuidelineCard';
import Emergency from './Emergency';
import EmergencyContacts from './EmergencyContacts';
import SosHistory from './SosHistory';

const SosEmergencyScreen = () => {
  const { width } = useWindowDimensions();
  const isTablet = width > 768;

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Navbar sits on top (Z-Index 50) */}
      <Navbar />

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ 
          paddingTop: 110, // Standardized padding for Navbar clearance
          paddingHorizontal: isTablet ? width * 0.2 : 20, 
          paddingBottom: 40 
        }}
        showsVerticalScrollIndicator={false}
      >
        <EmergencyHeader />
        <SosGuidelineCard />
        
        {/* Main SOS Trigger Button Area */}
        <Emergency />
        
        {/* This component contains the "Manage Contacts" button. 
           It will now trigger the router.push('/drawer/sospath/ManageContacts')
        */}
        <EmergencyContacts />
        
        <SosHistory />
      </ScrollView>
    </View>
  );
};

export default SosEmergencyScreen;