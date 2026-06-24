import React, { memo, useEffect, useState, useRef } from "react";
import { Text, View } from "react-native";
import { subscribeToZones } from "@/app/services/realtimeService";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { getUserLocation, getAddressFromCoords } from "@/app/services/locationService";

const Floodstatus = () => {
  const [zones, setZones] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [placeName, setPlaceName] = useState("Fetching...");

  const lastStatus = useRef<string | null>(null);
  const userLocationRef = useRef<any>(null);

  useEffect(() => {
    init();

    return subscribeToZones((data) => {
      const zonesList = data?.zones || [];
      setZones(zonesList);

      const zone = getCurrentZone(userLocationRef.current, zonesList);
      const currentState = zone?.state || "SAFE";

      if (currentState !== lastStatus.current) {
        lastStatus.current = currentState;
      }
    });
  }, []);

  const init = async () => {
    const loc = await getUserLocation();
    if (!loc) return;

    setUserLocation(loc.coords);
    userLocationRef.current = loc.coords;

    const address = await getAddressFromCoords(loc.coords);
    setPlaceName(address);
  };

  // ✅ FIXED: use coords passed, NOT state
  const getCurrentZone = (user: any, zones: any[]) => {
    if (!user) return null;

    for (let z of zones) {
      const dist = getDistance(
        user.latitude,
        user.longitude,
        z.lat,
        z.lng
      );

      if (dist <= z.radius_m) return z;
    }
    return null;
  };

  const getDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  // ✅ UI LOGIC RESTORED
  const zone = getCurrentZone(userLocation, zones);

  const getUI = () => {
    if (!zone) {
      return {
        label: "Not in Zone",
        message: "You are in a Safe Area",
        color: "#2563EB",
        location: placeName,
      };
    }

    switch (zone.state) {
      case "SAFE":
        return {
          label: "Safe",
          message: "Your area is currently safe",
          color: "#2563EB",
          location: zone.name,
        };
      case "WEAK_SIGNAL":
        return {
          label: "Unstable",
          message: "Signal is weak, stay alert",
          color: "#EAB308",
          location: zone.name,
        };
      case "FLOOD":
        return {
          label: "Flood Risk",
          message: "Flood detected in your area",
          color: "#EF4444",
          location: zone.name,
        };
      case "SOS":
        return {
          label: "SOS ALERT",
          message: "Emergency SOS active in this area. Immediate attention required.",
          color: "#841111",
          location: zone.name,
        };
      case "NO_SIGNAL":
        return {
          label: "No Signal",
          message: "No devices reporting",
          color: "#b39f1d",
          location: zone.name,
        };
      default:
        return {
          label: "Unknown",
          message: "Status unavailable. Contact Support.",
          color: "#64748B",
          location: placeName,
        };
    }
  };

  const ui = getUI();

  return (
    <View style={{ backgroundColor: ui.color }} className="rounded-[30px] p-6 mb-5 shadow-xl">

      <View className="flex-row justify-between items-start mb-6">
        <View className="flex-row items-center flex-1">
          <View className="bg-white/20 p-3 rounded-2xl">
            <MaterialCommunityIcons name="shield-outline" size={28} color="white" />
          </View>

          <View className="ml-4 flex-1">
            <Text className="text-white font-bold text-xl">
              Flood Status
            </Text>
            <Text className="text-blue-100 text-sm mt-1">
              Current Alert Level
            </Text>
          </View>
        </View>

        <View className="bg-white/20 px-4 py-1.5 rounded-full">
          <Text className="text-white font-bold text-xs uppercase">
            {ui.label}
          </Text>
        </View>
      </View>

      <View className="mb-5">
        <View className="flex-row items-center mb-3">
          <Ionicons name="checkmark-circle-outline" size={22} color="white" />
          <Text className="text-white ml-3 text-base font-medium">
            {ui.message}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Ionicons name="location-outline" size={22} color="white" />
          <Text className="text-white ml-3 text-base font-medium">
            {ui.location}
          </Text>
        </View>
      </View>

      <View className="h-[1px] bg-white/20 w-full mb-4" />

      <Text className="text-blue-100 text-xs italic">
        Live updates enabled
      </Text>
    </View>
  );
};

export default memo(Floodstatus);
