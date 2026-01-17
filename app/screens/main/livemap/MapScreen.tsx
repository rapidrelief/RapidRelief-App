import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import Navbar from '../dashboard/Navbar';
import Sidebar from '../dashboard/Sidebar';

// Import your new separate components
import MapHeader from './MapHeader';
import MapCard from './MapCard'; // This is your 'Map.tsx'
import MapLegend from './MapLegend';

const MapScreen = ({ onNavigate }: { onNavigate: (name: string) => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <View className="flex-1 bg-white">
      <Navbar onMenuPress={() => setIsMenuOpen(true)} />

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingTop: 110, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5">
          <MapHeader />
          
          <MapCard />
          
          <MapLegend />
        </View>
      </ScrollView>

      <Sidebar 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onNavigate={onNavigate}
        currentScreen="Map"
      />
    </View>
  );
};

export default MapScreen;