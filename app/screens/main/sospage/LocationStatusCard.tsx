import { MaterialIcons } from "@expo/vector-icons";
import { getAddressFromCoords, getUserLocation } from "@/app/services/locationService";
import React, { memo, useEffect, useState } from "react";
import { Text, View } from "react-native";

const LocationStatusCard = () => {
  const [address, setAddress] = useState("Fetching location...");
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadLocation = async () => {
      try {
        const loc = await getUserLocation();

        if (!mounted) return;

        if (!loc) {
          setAddress("Location permission denied");
          setIsActive(false);
          return;
        }

        const resolvedAddress = await getAddressFromCoords(loc.coords);

        if (!mounted) return;

        setAddress(resolvedAddress || `${loc.coords.latitude.toFixed(5)}, ${loc.coords.longitude.toFixed(5)}`);
        setIsActive(true);
      } catch (err) {
        console.log("SOS location error:", err);
        if (mounted) {
          setAddress("Location unavailable");
          setIsActive(false);
        }
      }
    };

    loadLocation();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View className="bg-slate-50 p-5 rounded-[24px] border border-slate-100 mt-4 w-full">
      <Text className="text-[#1E293B] font-bold text-center text-sm md:text-base mb-3">
        Current Location:
      </Text>

      <View className="flex-row items-center justify-center flex-wrap mb-2">
        <MaterialIcons name="location-on" size={18} color="#3B82F6" />
        <Text className="text-[#475569] font-semibold ml-1 text-[14px] text-center">
          {address}
        </Text>
      </View>

      <View className="flex-row items-center justify-center">
        <View className={`w-2 h-2 rounded-full mr-2 ${isActive ? "bg-[#22C55E]" : "bg-[#EF4444]"}`} />
        <Text className={`font-bold text-[12px] uppercase tracking-wider ${isActive ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
          {isActive ? "Location services active" : "Location services inactive"}
        </Text>
      </View>
    </View>
  );
};

export default memo(LocationStatusCard);
