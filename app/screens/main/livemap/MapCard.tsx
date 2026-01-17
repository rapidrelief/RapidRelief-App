import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';

const MapCard = () => {
  // Animation value for the blinking dot
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Creates a looping fade in/out effect
    Animated.loop(
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
    ).start();
  }, []);

  return (
    <View className="p-4 border border-slate-100 rounded-[30px] bg-white shadow-sm">
      
      {/* 1. Control Bar */}
      <View className="flex-row justify-between mb-4 px-1">
        <View className="flex-row space-x-2">
          <TouchableOpacity className="bg-white border border-slate-100 px-4 py-2 rounded-xl flex-row items-center shadow-sm">
            <Feather name="layers" size={16} color="#1e293b" />
            <Text className="text-slate-800 font-semibold ml-2">Layers</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-white border border-slate-100 px-4 py-2 rounded-xl flex-row items-center shadow-sm">
            <Feather name="navigation" size={16} color="#1e293b" />
            <Text className="text-slate-800 font-semibold ml-2">My Location</Text>
          </TouchableOpacity>
        </View>
        
        <View className="flex-row space-x-2">
          <TouchableOpacity className="bg-white border border-slate-100 p-2 rounded-xl shadow-sm">
            <Feather name="search" size={18} color="#1e293b" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-white border border-slate-100 p-2 rounded-xl shadow-sm">
            <Feather name="minus" size={18} color="#1e293b" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Visual Map Container with Grid */}
      <View className="h-[450px] bg-[#eef6ff] rounded-[32px] items-center justify-center border border-blue-100 relative overflow-hidden">
        
        {/* The Grid Pattern Overlay (Visual background) */}
        <View className="absolute inset-0 flex-row flex-wrap justify-between p-2 opacity-10">
          {Array.from({ length: 50 }).map((_, i) => (
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
            <Text className="text-white text-[12px] font-bold">Your Location</Text>
          </View>
          
          <View className="items-center justify-center">
             {/* Pulse ring */}
             <View className="w-20 h-20 bg-blue-500/20 rounded-full absolute" />
             {/* Main Circle Icon */}
             <View className="w-16 h-16 bg-blue-600 rounded-full items-center justify-center border-4 border-white shadow-xl">
                <Feather name="map-pin" size={28} color="white" />
             </View>
          </View>
        </View>

        {/* Text Labels */}
        <View className="mt-4 items-center">
          <Text className="text-slate-800 font-bold text-xl">Interactive Map View</Text>
          <Text className="text-slate-500 text-center text-sm px-12 mt-1 leading-5">
            Real-time location tracking with nearby safe zones and flood alerts
          </Text>
        </View>
        
        {/* 5. Live Tracking Status Badge with Animated Dot */}
        <View className="absolute bottom-8 bg-[#2563eb] px-8 py-3 rounded-2xl flex-row items-center shadow-lg">
          <Animated.View 
            style={{ opacity: blinkAnim }}
            className="w-2.5 h-2.5 rounded-full bg-white mr-3" 
          />
          <Text className="text-white font-bold text-sm tracking-wide">
            Live Tracking Active
          </Text>
        </View>

        {/* Floating Zoom Buttons (Top Right inside Map) */}
        <View className="absolute top-4 right-4">
           <TouchableOpacity className="bg-white p-2 rounded-xl shadow-md mb-2">
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

export default MapCard;