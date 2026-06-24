import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState, useRef } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Navbar from "../Navbar";
import NotificationCard from "./NotificationCard";
import NotificationToggle from "./NotificationToggle";

import {
  getNotifications,
  markAllRead,
  clearNotifications,
  AppNotification,
  addNotification,
  getTimeAgo,
} from "@/app/services/notificationService";

import * as Location from "expo-location";
import { subscribeToZones } from "@/app/services/realtimeService";
import { useAppSettings } from "@/app/store/useAppSettings";

const NotificationScreen = () => {
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const {settings, updateState } = useAppSettings();

  // ✅ FIX: Use refs for live values
  const settingsRef = useRef(settings);
  const lastZoneState = useRef<string | null>(null);
  const userLocationRef = useRef<any>(null);

  // Sync settings → ref
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    loadNotifications();
    const stop = startZoneMonitoring();
    return () => stop && stop();
  }, []);

  const loadNotifications = async () => {
    const data = await getNotifications();
    setNotifications(data);
  };

  // ✅ FIXED MONITOR
  const startZoneMonitoring = () => {
    let unsubscribeZones: any;
    let locationSubscription: any;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      userLocationRef.current = loc.coords;

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 10,
        },
        (position) => {
          userLocationRef.current = position.coords;
        }
      );

      unsubscribeZones = subscribeToZones((zonesData) => {
        try {
          const currentLocation = userLocationRef.current;
          if (!currentLocation) return;

          const zone = getCurrentZone(currentLocation, zonesData?.zones || []);
          const currentState = zone?.state || "SAFE";

          // FIRST RUN → store only
          if (lastZoneState.current === null) {
            lastZoneState.current = currentState;
            return;
          }

          // STATE CHANGE
          if (currentState !== lastZoneState.current) {
            lastZoneState.current = currentState;

            // ✅ USE REF (not state)
            handleZoneNotification(currentState, zone, settingsRef.current);
          }
        } catch (err) {
          console.log("Notification error:", err);
        }
      });
    })();

    return () => {
      if (unsubscribeZones) unsubscribeZones();
      if (locationSubscription) locationSubscription.remove();
    };
  };

  const getCurrentZone = (user: any, zones: any[]) => {
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

  // ✅ FIXED: pass settings explicitly
  const handleZoneNotification = async (
    state: string,
    zone: any,
    settings: typeof settingsRef.current
  ) => {
    if (!settings.allNotifications) return;

    let notif: AppNotification | null = null;

    if (state === "FLOOD" && settings.flood) {
      notif = {
        id: Date.now().toString(),
        type: "flood",
        title: "Flood Alert",
        message: `Flood detected in ${zone?.name}`,
        createdAt: Date.now(),
        isUnread: true,
      };
    }

    if (state === "SOS" && settings.sos) {
      notif = {
        id: Date.now().toString(),
        type: "sos",
        title: "SOS Alert",
        message: `Emergency SOS active in ${zone?.name || "your area"}`,
        createdAt: Date.now(),
        isUnread: true,
      };
    }

    if (state === "SAFE" && settings.emergency) {
      notif = {
        id: Date.now().toString(),
        type: "success",
        title: "Safe Area",
        message: "You are now in a safe area",
        createdAt: Date.now(),
        isUnread: true,
      };
    }

    if (state === "WEAK_SIGNAL" && settings.emergency) {
      notif = {
        id: Date.now().toString(),
        type: "info",
        title: "Weak Signal",
        message: "Signal is unstable in your area",
        createdAt: Date.now(),
        isUnread: true,
      };
    }

    if (state === "NO_SIGNAL" && settings.emergency) {
      notif = {
        id: Date.now().toString(),
        type: "alert",
        title: "No Signal",
        message: "No data from your area",
        createdAt: Date.now(),
        isUnread: true,
      };
    }

    if (!notif) return;

    const updated = await addNotification(notif);
    setNotifications(updated);
  };

  const unreadCount = notifications.filter(n => n.isUnread).length;

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <Navbar />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 70,
          paddingBottom: 40,
        }}
      >
        {/* HEADER */}
        <View className="px-6 mt-6 mb-4">
          <View className="flex-row items-center">
            <View className="bg-[#3B82F6] p-3 rounded-2xl mr-4">
              <MaterialCommunityIcons name="bell-outline" size={28} color="white" />
            </View>

            <View>
              <Text className="text-2xl font-bold text-[#1E293B]">
                Notifications
              </Text>

              {/* ✅ NEW: STATUS LABEL */}
              <Text className="text-[#64748B] text-sm">
                {settings.allNotifications
                  ? `${unreadCount} unread notifications`
                  : "Notifications Off"}
              </Text>
            </View>
          </View>

          {/* BUTTONS */}
          <View className="flex-row mt-4">
            <TouchableOpacity
              onPress={async () => {
                const updated = await markAllRead();
                setNotifications(updated);
              }}
              className="flex-1 mr-2 bg-white border border-gray-200 py-2 rounded-xl items-center"
            >
              <Text className="text-gray-600 font-bold text-xs">
                Mark Read
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={async () => {
                const updated = await clearNotifications();
                setNotifications(updated);
              }}
              className="flex-1 ml-2 bg-red-50 border border-red-200 py-2 rounded-xl items-center"
            >
              <Text className="text-red-600 font-bold text-xs">
                Clear All
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* NOTIFICATIONS */}
        <View className="px-6">
          <Text className="font-bold text-xl text-[#1E293B] mb-4">
            Recent Notifications
          </Text>

          {notifications.length === 0 ? (
            <Text className="text-gray-400 text-center mt-10">
              No notifications yet
            </Text>
          ) : (
            notifications.slice(0, 5).map(n => (
              <View key={n.id} className="mb-3">
                <NotificationCard
                  {...n}
                  time={getTimeAgo(n.createdAt)}
                />
              </View>
            ))
          )}
        </View>

        {/* SETTINGS */}
        <View className="mx-6 mt-8 bg-white p-6 rounded-[32px] border border-[#F1F5F9]">
          <Text className="font-bold text-lg mb-4">
            Notification Preferences
          </Text>

          <NotificationToggle
            title="All Notifications"
            description="Master control"
            icon="bell-outline"
            iconColor="#3B82F6"
            isEnabled={settings.allNotifications}
            onToggle={() => {
              const newValue = !settings.allNotifications;

              updateState({
                allNotifications: newValue,

                emergency: newValue ? settings.emergency : false,
                flood: newValue ? settings.flood : false,
                sos: newValue ? settings.sos : false,

              })
            }}
          />

          <NotificationToggle
            title="Emergency Alerts"
            description="Zone changes"
            icon="alert-outline"
            iconColor="#EF4444"
            isEnabled={settings.allNotifications && settings.emergency}
            onToggle={() => {
              if (!settings.allNotifications) return;
              updateState({
                emergency: !settings.emergency,
              })
            }}
          />

          <NotificationToggle
            title="Flood Alerts"
            description="Flood warnings"
            icon="alert-circle-outline"
            iconColor="#F59E0B"
            isEnabled={settings.allNotifications && settings.flood}
            onToggle={() => {
              if (!settings.allNotifications) return;
              updateState({
                flood: !settings.flood,
              })
            }}
          />

          <NotificationToggle
            title="SOS Alerts"
            description="SOS zone changes"
            icon="alert-circle-outline"
            iconColor="#EF4444"
            isEnabled={settings.allNotifications && settings.sos}
            onToggle={() => {
              if (!settings.allNotifications) return;
              updateState({
                sos: !settings.sos,
              })
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationScreen;
