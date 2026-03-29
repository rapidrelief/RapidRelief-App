import React, { memo, useEffect, useState } from "react";
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from "expo-location";
import { getZonesMap } from "@/app/services/api";

const MovementStatus = () => {

  const [zones, setZones] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<any>(null);

  const [lastMove, setLastMove] = useState<number>(Date.now());
  const [isSafe, setIsSafe] = useState(true);
  const [tracking, setTracking] = useState(false);

  
  //loadig zones
  const loadZones = async () => {
    try {
      const data = await getZonesMap();
      setZones(data?.zones || []);
    } catch (err) {console.log("Zone API error", err);

    }
  };

  //get location
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const loc = await Location.getCurrentPositionAsync({});
    setUserLocation(loc.coords);
  };

  //Distance function
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

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Find current zone
  const getCurrentZone = () => {
    if (!userLocation) return null;

    for (let z of zones) {
      const dist = getDistance(
        userLocation.latitude,
        userLocation.longitude,
        z.lat,
        z.lng
      );
      if (dist <= z.radius_m) return z;
    }
    return null;
  };

  const zone = getCurrentZone();

  //control tracking (if in flood/sos zone = on || if safe = off )
  useEffect(() => {
    if (!zone || (zone.state !== "FLOOD" && zone.state !== "SOS")) {
      setTracking(false);
      setIsSafe(true);
      return;
    }

    setTracking(true);
  }, [zone]);

  //location watch if tracking
  useEffect(() => {
    let subscription: any;

    const startTracking = async () => {
      if (!tracking) return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
        },
        () => {
          setLastMove(Date.now());
        }
      );
    };

    startTracking();

    return () => subscription?.remove();
    
  }, [tracking]);

  //timeout check
  useEffect(() => {
    if (!tracking) return;

    const interval = setInterval(() => {
      const diff = (Date.now() - lastMove) / 1000;

      if (diff > 60) {
        setIsSafe(false);
      }else {
        setIsSafe(true);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [lastMove, tracking]);


  //UI logic
  const getUI = () => {
    if (!zone || (zone.state !== "FLOOD" && zone.state !== "SOS")) {
      return {
        color: "#00A844",
        title: "Safe Area",
        msg: "Movement tracking disabled",
        dc: "Tracking activates only in danger zones. ",
      };
    }

    return isSafe
      ? {
          color: "#00A844",
          title: "You are Safe",
          msg: "Movement detected recently",
          dc: "Tracking is Active. ",
        }
      : {
          color: "#D10606",
          title: "No Movement",
          msg: "No Movement detected for 60+ Seconds",
          dc: "you will be flaged if no movement continues.",
        };
  };

  const ui = getUI();

  return (
    <View 
    className= "rounded-[30px] p-6 mb-5 shadow-xl"
    style={{ backgroundColor: ui.color }} 
      >
      
      {/* Header Row */}
      <View className="flex-row items-center mb-6">
        <View className="bg-white/20 p-3 rounded-2xl">
          <Ionicons name="walk-outline" size={28} color="white" />
        </View>

        <View className="ml-4 flex-1">
          <Text className="text-white font-bold text-xl">Movement Status</Text>
          <Text className="text-green-100 text-sm mt-1">Activity Monitoring</Text>
        </View>
      </View>

      {/* Inner Status Box */}
      <View className="bg-white/20 rounded-2xl p-5 mb-4">
          <Text className="text-white font-bold text-lg">
            {ui.title}
          </Text>

          <Text className="text-white/80 text-sm mt-1">
          {ui.msg}
        </Text>
      </View>

      {/* Bottom Disclaimer */}
      <Text className="text-white/80 text-[13px] italic">
        {ui.dc}     
        </Text>
    </View>
  );
};

export default memo(MovementStatus);