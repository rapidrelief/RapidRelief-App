import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { memo, useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { getUserLocation, getAddressFromCoords } from "@/app/services/locationService";

const UserLocation = () => {
  const router = useRouter();

  // State for current location name
  const [currentLocation, setCurrentLocation] = useState("Fetching...");
  // State to track if live location is active
  const [liveActive, setLiveActive] = useState(false);


  useEffect(() => {
    fetchLocation();
  }, []);

    const fetchLocation = async () => {
      try{
        const loc = await getUserLocation();

        if (!loc){
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
    <View className="bg-white border border-gray-100 rounded-[35px] p-6 mb-10 shadow-sm">
      {/* Header with View Map Button */}
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-gray-900 text-xl font-bold">Your Location</Text>

        <TouchableOpacity
          activeOpacity={0.7}
          className="flex-row items-center border border-gray-200 px-3 py-1.5 rounded-xl"
          onPress={() => router.push("/drawer/LiveMap")} // this will take to MapCard route
        >
          <Ionicons name="location-outline" size={18} color="#4B5563" />
          <Text className="ml-2 text-gray-600 font-semibold">View Map</Text>
        </TouchableOpacity>
      </View>

      {/* Map Placeholder Container */}
      <View className="bg-blue-50/50 rounded-[30px] p-8 items-center justify-center border border-blue-100">
        {/* Large Map Pin Icon */}
        <View className="mb-4 bg-white p-4 rounded-full shadow-sm">
          <MaterialCommunityIcons name="map-marker" size={48} color="#2563EB" />
        </View>

        <Text className="text-gray-800 text-lg font-bold mb-1">
          Interactive Map
        </Text>

        {/* Current Location Text */}
        <Text className="text-gray-500 text-center mb-6 px-2">
          {currentLocation}
        </Text>

        {/* Live Location Badge */}
        <View
          className={`flex-row items-center px-6 py-3 rounded-2xl shadow-md ${
            liveActive ? "bg-blue-600" : "bg-red-600"
          }`}
        >
          <View className="w-2.5 h-2.5 bg-white rounded-full mr-3 opacity-80" />
          <Text className="text-white font-bold tracking-tight">
            {liveActive ? "Live Location Active" : "Live Location Not Active"}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default memo(UserLocation);