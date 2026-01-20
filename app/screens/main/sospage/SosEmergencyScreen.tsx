import React from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import EmergencyHeader from './EmergencyHeader';
import SosGuidelineCard from './SosGuidelineCard';
import Emergency from './Emergency';
import EmergencyContacts from './EmergencyContacts';
import SosHistory from './SosHistory';

const SosEmergencyScreen = () => {
  const { width } = useWindowDimensions();
  
  // Future-proof: limit the width on tablets so content doesn't stretch awkwardly
  const isTablet = width > 768;

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ 
          paddingTop: 120, // Enough room for your Navbar
          paddingHorizontal: isTablet ? width * 0.2 : 20, // Center content on tablets
          paddingBottom: 40 
        }}
        showsVerticalScrollIndicator={false}
      >
        <EmergencyHeader />
        <SosGuidelineCard />
        <Emergency />
        <EmergencyContacts />
        <SosHistory />
      </ScrollView>
    </View>
  );
};

export default SosEmergencyScreen;