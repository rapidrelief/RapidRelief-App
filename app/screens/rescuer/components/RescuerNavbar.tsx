import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import { subscribeToZones } from "@/app/services/realtimeService";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";

import { useSafeAreaInsets } from "react-native-safe-area-context";

const RescuerNavbar = () => {
  const navigation: any = useNavigation();
  const insets = useSafeAreaInsets();

  const [zones, setZones] = useState<any[]>([]);
  const [currentZone, setCurrentZone] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<any>(null);
  const zonesRef = useRef<any[]>([]);
  const userLocationRef = useRef<any>(null);

  const [modalVisible, setModalVisible] = useState(false);

  // ================= INIT =================
  useEffect(() => {
    let unsubscribeZones: any;
    let locationSubscription: any;

    const start = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation(loc.coords);
        userLocationRef.current = loc.coords;

        unsubscribeZones = subscribeToZones((data) => {
          const list = data?.zones || [];
          zonesRef.current = list;
          setZones(list);
          setCurrentZone(getCurrentZone(userLocationRef.current, list));
        });

        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 10,
          },
          (position) => {
            setUserLocation(position.coords);
            userLocationRef.current = position.coords;
            setCurrentZone(getCurrentZone(position.coords, zonesRef.current));
          }
        );
      } catch (e) {
        console.log(e);
      }
    };

    start();

    return () => {
      if (unsubscribeZones) unsubscribeZones();
      if (locationSubscription) locationSubscription.remove();
    };
  }, []);

  // ================= DISTANCE =================
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
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

  const getCurrentZone = (user: any, zones: any[]) => {
    if (!user) return null;

    for (let z of zones) {
      const dist = getDistance(user.latitude, user.longitude, z.lat, z.lng);
      if (dist <= z.radius_m) return z;
    }
    return null;
  };

  // ================= STATUS LOGIC =================
  const getStatus = () => {
    if (!currentZone) {
      return {
        label: "SAFE AREA",
        color: "#22C55E",
        reason: "You are not inside any active zone boundary. Area is considered safe.",
        location: "Current GPS Location",
      };
    }

    switch (currentZone.state) {
      case "SAFE":
        return {
          label: "SAFE",
          color: "#22C55E",
          reason:
            "All sensors in this zone are stable and no flood or signal issue detected.",
          location: currentZone.name,
        };

      case "WEAK_SIGNAL":
        return {
          label: "WEAK SIGNAL",
          color: "#EAB308",
          reason:
            "Some devices in this zone are reporting weak connectivity or unstable signals.",
          location: currentZone.name,
        };

      case "FLOOD":
        return {
          label: "FLOOD ALERT",
          color: "#EF4444",
          reason:
            "Water level sensors detected flooding activity in this region.",
          location: currentZone.name,
        };

       case "SOS":
        return {
          label: "SOS ALERT",
          reason: "Emergency SOS active in this area. Immediate attention required.",
          color: "#841111",
          location: currentZone.name,
        }; 

      case "NO_SIGNAL":
        return {
          label: "NO SIGNAL",
          color: "#c6b304",
          reason:
            "You are in a ZONE. No devices are currently responding in this zone (possible outage or damage).",
          location: currentZone.name,
        };

      default:
        return {
          label: "UNKNOWN",
          color: "#64748B",
          reason: "Status could not be determined from sensor data.",
          location: currentZone.name,
        };
    }
  };

  const status = getStatus();

  return (
    <View
      style={{
        position: "absolute",
        top: Math.max(insets.top + 10, 45),
        left: 20,
        right: 20,
        zIndex: 50,
        shadowColor: "#1E1B4B",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 12,
      }}
    >
      <LinearGradient
        colors={["rgba(55, 48, 163, 0.95)", "rgba(30, 27, 75, 0.95)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 999,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.15)",
          overflow: "hidden",
        }}
      >
      {/* LEFT */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={{ marginLeft: 10, fontSize: 15, fontWeight: "800", color: "#FFFFFF", letterSpacing: 0.5 }}>
          Rescuer Portal
        </Text>
      </View>

      {/* ================= STATUS PILL ================= */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: status.color,
          shadowColor: status.color,
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        {/* DOT */}
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: status.color,
            marginRight: 6,
            shadowColor: status.color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 4,
          }}
        />

        <Text
          style={{
            fontSize: 10,
            fontWeight: "800",
            color: "#FFFFFF",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {status.label}
        </Text>
      </TouchableOpacity>

      {/* RIGHT PROFILE */}
      <TouchableOpacity
        onPress={() => router.push("/rescuer/profile")}
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.2)",
        }}
      >
        <Ionicons name="person" size={18} color="#FFFFFF" />
      </TouchableOpacity>

      {/* ================= MODAL ================= */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              padding: 16,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
              Status Explanation
            </Text>

            <ScrollView>
              {/* MAIN STATUS CARD */}
              <View
                style={{
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: "#F9FAFB",
                }}
              >
                <Text style={{ fontWeight: "700", fontSize: 16 }}>
                  {status.label}
                </Text>

                <Text style={{ marginTop: 6, color: "#374151" }}>
                  📍 {status.location}
                </Text>

                <Text style={{ marginTop: 10, color: "#6B7280" }}>
                  {status.reason}
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                marginTop: 12,
                backgroundColor: "#EF4444",
                padding: 10,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </LinearGradient>
    </View>
  );
};

export default RescuerNavbar;
