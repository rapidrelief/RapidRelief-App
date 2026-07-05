import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { memo, useEffect, useState, useRef } from "react";
import { Text, TouchableOpacity, View, Animated } from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { getUserLocation, getAddressFromCoords } from "@/app/services/locationService";

const UserLocation = () => {
  const router = useRouter();

  const [currentLocation, setCurrentLocation] = useState("Fetching...");
  const [liveActive, setLiveActive] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchLocation();
  }, []);

  useEffect(() => {
    if (liveActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [liveActive]);

  const fetchLocation = async () => {
    try {
      const loc = await getUserLocation();

      if (!loc) {
        setCurrentLocation("Permission denied");
        setLiveActive(false);
        return;
      }

      setLiveActive(true);
      const address = await getAddressFromCoords(loc.coords);
      setCurrentLocation(address);

    } catch (err) {
      console.log("Location fetch error:", err);
      setCurrentLocation("Location error");
      setLiveActive(false);
    }
  };

  return (
    <View className="bg-white rounded-[24px] p-5 mb-5 shadow-sm shadow-slate-200/50 border border-slate-100">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-5">
        <View className="flex-row items-center">
          <View className="bg-blue-50 p-2 rounded-full mr-3">
            <Ionicons name="compass" size={20} color="#2563EB" />
          </View>
          <Text className="text-slate-800 text-[17px] font-bold">Your Location</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          className="flex-row items-center bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full shadow-sm"
          onPress={() => router.push("/drawer/LiveMap")}
        >
          <Text className="text-slate-700 text-[11px] font-bold uppercase tracking-wider mr-1">Map</Text>
          <Ionicons name="chevron-forward" size={14} color="#334155" />
        </TouchableOpacity>
      </View>

      {/* Map Premium Container */}
      <View className="bg-[#F8FAFC] rounded-[20px] p-6 items-center justify-center border border-slate-200/60 overflow-hidden">
        {/* Subtle Background Pattern / Decorator */}
        <View className="absolute -right-6 -top-6 bg-blue-100/30 w-24 h-24 rounded-full blur-xl" />
        <View className="absolute -left-6 -bottom-6 bg-indigo-100/30 w-20 h-20 rounded-full blur-lg" />

        <View className="mb-3 bg-white p-3.5 rounded-full shadow-sm shadow-slate-300/40 border border-slate-50 z-10">
          <MaterialCommunityIcons name="map-marker-radius" size={32} color="#2563EB" />
        </View>

        <Text className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mb-1 z-10">
          Current Position
        </Text>

        <Text className="text-slate-800 text-center text-[15px] font-semibold mb-5 px-2 z-10">
          {currentLocation}
        </Text>

        {/* Premium Live Badge */}
        <View
          className={`flex-row items-center px-4 py-2 rounded-full border shadow-sm z-10 ${
            liveActive ? "bg-emerald-50 border-emerald-200 shadow-emerald-100" : "bg-red-50 border-red-200 shadow-red-100"
          }`}
        >
          <Animated.View 
            style={{ opacity: pulseAnim }}
            className={`w-2 h-2 rounded-full mr-2 ${liveActive ? "bg-emerald-500" : "bg-red-500"}`} 
          />
          <Text className={`text-[11px] font-bold uppercase tracking-wider ${liveActive ? "text-emerald-700" : "text-red-700"}`}>
            {liveActive ? "Live Tracking On" : "Tracking Offline"}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default memo(UserLocation);