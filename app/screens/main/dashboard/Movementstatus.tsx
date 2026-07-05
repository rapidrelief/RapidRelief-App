import React, { memo, useEffect, useRef, useState } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { getZonesMap } from "@/app/services/api";
import { sendUserSOS } from "@/app/services/sosService";
import { subscribeToZones } from "@/app/services/realtimeService";

const MovementStatus = () => {

  const [zones, setZones] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<any>(null);

  const [lastMove, setLastMove] = useState<number>(Date.now());
  const [isSafe, setIsSafe] = useState(true);
  const [tracking, setTracking] = useState(false);

  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const autoSosSent = useRef(false);

  // ---------------- LOAD ZONES ----------------
  const loadZones = async () => {
    try {
      const data = await getZonesMap();
      setZones(data?.zones || []);
    } catch (err) {
      console.log("Zone API error", err);
    }
  };

  // ---------------- LOCATION ----------------
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const loc = await Location.getCurrentPositionAsync({});
    setUserLocation(loc.coords);
  };

  useEffect(() => {
    loadZones();
    getLocation();

    const interval = setInterval(() => {
      getLocation();
    }, 5000);

    const unsubscribe = subscribeToZones((data) => {
      setZones(data?.zones || []);
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  // ---------------- DISTANCE ----------------
  const getDistance = (lat1:number, lon1:number, lat2:number, lon2:number) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // ---------------- ZONE DETECTION ----------------
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

  // ---------------- TRACKING CONTROL ----------------
  useEffect(() => {
    if (!zone) {
      setTracking(false);
      setIsSafe(true);
      autoSosSent.current = false;
      return;
    }

    if (zone.state === "FLOOD" || zone.state === "SOS") {
      setTracking(true);
    } else {
      setTracking(false);
      setIsSafe(true);
      autoSosSent.current = false;
    }
  }, [zone]);

  // ---------------- MOVEMENT WATCH ----------------
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

    return () => {
      if (subscription) subscription.remove();
    };
  }, [tracking]);

  // ---------------- TIMEOUT CHECK ----------------
  useEffect(() => {
    if (!tracking) return;

    const interval = setInterval(() => {
      const diff = (Date.now() - lastMove) / 1000;
      const safe = diff <= 60;
      setIsSafe(safe);

      if (!safe && !autoSosSent.current) {
        autoSosSent.current = true;
        sendUserSOS("AUTO").catch((err) => {
          console.log("Auto SOS error:", err);
          autoSosSent.current = false;
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [lastMove, tracking]);

  // ---------------- PULSE ANIMATION ----------------
  useEffect(() => {
    let animation: any;

    if (zone) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.6,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      );

      animation.start();
    } else {
      glowAnim.stopAnimation();
      glowAnim.setValue(0);
    }

    return () => {
      animation?.stop();
    };
  }, [zone]);

  // ---------------- UI LOGIC ----------------
  const getUI = () => {
    if (!zone) {
      return {
        color: "#00A844",
        title: "Safe Area",
        msg: "Movement tracking disabled",
        dc: "Tracking activates only in danger zones.",
        trackingLabel: "DISABLED",
        trackingColor: "#86EFAC"
      };
    }

    if (zone.state !== "FLOOD" && zone.state !== "SOS") {
      return {
        color: "#00A844",
        title: "Zone Detected",
        msg: "Location in zone detected",
        dc: "Movement tracking will activate in case of flood or SOS.",
        trackingLabel: "STANDBY",
        trackingColor: "#86EFAC"
      };
    }

    return isSafe
      ? {
          color: "#00A844",
          title: "You are Safe",
          msg: "Movement detected recently",
          dc: "Tracking is ACTIVE.",
          trackingLabel: "ACTIVE",
          trackingColor: "#86EFAC"
        }
      : {
          color: "#D10606",
          title: "No Movement",
          msg: "No movement detected for 60+ seconds",
          dc: "You will be flagged if inactivity continues.",
          trackingLabel: "ACTIVE",
          trackingColor: "#FCA5A5"
        };
  };

  const ui = getUI();

  // ---------------- UI ----------------
  return (
    <Animated.View
      style={{ backgroundColor: ui.color }}
      className="rounded-[20px] p-4 mb-3 shadow-sm overflow-hidden flex-row items-center justify-between"
    >
      {/* Glow Effect */}
      {zone && (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: "black",
              opacity: glowAnim.interpolate({
                inputRange: [0.3, 0.6],
                outputRange: [0.08, 0.25],
              }),
            },
          ]}
        />
      )}

      <View className="flex-row items-center flex-1 pr-2">
        <View className="bg-white/20 p-2.5 rounded-full z-10">
          <Ionicons name="walk-outline" size={24} color="white" />
        </View>

        <View className="ml-3 flex-1 z-10">
          <Text className="text-white font-bold text-[16px]">
            Movement Status
          </Text>
          <Text className="text-white/90 text-[12px] mt-0.5" numberOfLines={1}>
            {ui.title} • {ui.trackingLabel === 'STANDBY' ? 'Waiting for alerts' : ui.msg}
          </Text>
        </View>
      </View>

      <View style={{ backgroundColor: ui.trackingColor }} className="px-3 py-1.5 rounded-full z-10">
        <Text className="text-[10px] font-bold text-black uppercase tracking-wide">
          {ui.trackingLabel}
        </Text>
      </View>
    </Animated.View>
  );
};

export default memo(MovementStatus);
