import React, { useEffect, useRef, memo } from 'react';
import { View, Text, TouchableOpacity, Animated, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';

const MapCard = () => {
  // Get screen dimensions for dynamic height adjustment
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [blinkAnim]);

  // Make map height responsive: smaller on short screens, max 450 on large ones
  const responsiveMapHeight = screenHeight < 700 ? 350 : 450;

  return (
    <View className="p-4 border border-slate-100 rounded-[30px] bg-white shadow-sm w-full">
      
      {/* 1. Control Bar - Replaced space-x with gap for better responsiveness */}
      <View className="flex-row justify-between items-center mb-4 px-1">
        <View className="flex-row gap-2">
          <TouchableOpacity className="bg-white border border-slate-100 px-4 py-2 rounded-xl flex-row items-center shadow-sm">
            <Feather name="layers" size={16} color="#1e293b" />
            <Text className="text-slate-800 font-semibold ml-2 text-xs md:text-sm">Layers</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-white border border-slate-100 px-4 py-2 rounded-xl flex-row items-center shadow-sm">
            <Feather name="navigation" size={16} color="#1e293b" />
            <Text className="text-slate-800 font-semibold ml-2 text-xs md:text-sm">My Location</Text>
          </TouchableOpacity>
        </View>
        
        <View className="flex-row gap-2">
          <TouchableOpacity className="bg-white border border-slate-100 p-2 rounded-xl shadow-sm">
            <Feather name="search" size={18} color="#1e293b" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-white border border-slate-100 p-2 rounded-xl shadow-sm">
            <Feather name="minus" size={18} color="#1e293b" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Visual Map Container with Grid */}
      <View 
        style={{ height: responsiveMapHeight }}
        className="bg-[#eef6ff] rounded-[32px] items-center justify-center border border-blue-100 relative overflow-hidden"
      >
        
        {/* The Grid Pattern Overlay - Slightly reduced length for cleaner rendering */}
        <View className="absolute inset-0 flex-row flex-wrap justify-between p-2 opacity-10">
          {Array.from({ length: 24 }).map((_, i) => (
            <View key={i} className="w-2 h-2 bg-blue-600 rounded-sm m-4" />
          ))}
        </View>

        {/* 3. Secondary/Background Pin */}
        <View className="absolute top-[35%] left-[25%] opacity-40">
           <Feather name="map-pin" size={24} color="#2563eb" />
        </View>

        {/* 4. Main Your Location Marker (Central) */}
        <View className="items-center z-10">
          <View className="bg-[#2563eb] px-4 py-1 rounded-md mb-2 shadow-sm">
            <Text className="text-white text-[10px] md:text-[12px] font-bold">Your Location</Text>
          </View>
          
          <View className="items-center justify-center">
             <View className="w-16 h-16 md:w-20 md:h-20 bg-blue-500/20 rounded-full absolute" />
             <View className="w-14 h-14 md:w-16 md:h-16 bg-blue-600 rounded-full items-center justify-center border-4 border-white shadow-xl">
                <Feather name="map-pin" size={24} color="white" />
             </View>
          </View>
        </View>

        {/* Text Labels - Added responsive padding */}
        <View className="mt-4 items-center px-4">
          <Text className="text-slate-800 font-bold text-lg md:text-xl text-center">Interactive Map View</Text>
          <Text className="text-slate-500 text-center text-xs md:text-sm mt-1 leading-5">
            Real-time tracking with nearby safe zones and flood alerts
          </Text>
        </View>
        
        {/* 5. Live Tracking Status Badge with Animated Dot */}
        <View className="absolute bottom-8 bg-[#2563eb] px-6 py-3 rounded-2xl flex-row items-center shadow-lg">
          <Animated.View 
            style={{ opacity: blinkAnim }}
            className="w-2.5 h-2.5 rounded-full bg-white mr-3" 
          />
          <Text className="text-white font-bold text-xs md:text-sm tracking-wide">
            Live Tracking Active
          </Text>
        </View>

        {/* Floating Zoom Buttons (Top Right inside Map) */}
        <View className="absolute top-4 right-4 gap-2">
           <TouchableOpacity className="bg-white p-2 rounded-xl shadow-md">
             <Feather name="zoom-in" size={20} color="black" />
           </TouchableOpacity>
           <TouchableOpacity className="bg-white p-2 rounded-xl shadow-md">
             <Feather name="zoom-out" size={20} color="black" />
           </TouchableOpacity>
        </View>

      </View>
    </View>
  );
};

// Export as memo to prevent parent re-renders from affecting the internal animation
export default memo(MapCard);