import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import Navbar from '../dashboard/Navbar';
import AlertStats from './AlertStats';
import AlertItem from './AlertItem';
import StayInformed from './StayInformed';
import NotificationToggle from '../dashboard/Notification/NotificationToggle';

import * as Location from "expo-location";
import { subscribeToZones } from "@/app/services/realtimeService";
import { useAppSettings } from "@/app/store/useAppSettings";

const AlertsScreen = () => {

  const { settings, updateState } = useAppSettings();

  const [alerts, setAlerts] = useState<any[]>([]);
  const lastZoneState = useRef<string | null>(null);
  const userLocationRef = useRef<any>(null);

  // ✅ FIX: live settings reference
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    const stop = startMonitoring();
    return () => stop && stop();
  }, []);

  const startMonitoring = () => {
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

          if (lastZoneState.current === null) {
            lastZoneState.current = currentState;
            return;
          }

          if (currentState !== lastZoneState.current) {
            lastZoneState.current = currentState;

            const s = settingsRef.current;

            // ✅ FIX: always use latest settings
            if (s.allNotifications && s.alertsEnabled) {
              createAlert(currentState, zone);
            }
          }

        } catch (err) {
          console.log("Alert error:", err);
        }
      });
    })();

    return () => {
      if (unsubscribeZones) unsubscribeZones();
      if (locationSubscription) locationSubscription.remove();
    };
  };

  const createAlert = (state: string, zone: any) => {
    let alert = null;

    if (state === "FLOOD") {
      alert = {
        title: "Flood Alert",
        location: zone?.name || "Unknown",
        time: "Now",
        level: "High",
        description: "Flood detected in your area"
      };
    }

    if (state === "SOS") {
      alert = {
        title: "SOS Alert",
        location: zone?.name || "Unknown",
        time: "Now",
        level: "High",
        description: "Emergency SOS active in your area"
      };
    }

    if (state === "NO_SIGNAL") {
      alert = {
        title: "No Signal",
        location: zone?.name || "Unknown",
        time: "Now",
        level: "Medium",
        description: "No data from this zone"
      };
    }

    if (state === "WEAK_SIGNAL") {
      alert = {
        title: "Weak Signal",
        location: zone?.name || "Unknown",
        time: "Now",
        level: "Medium",
        description: "Signal unstable in your area"
      };
    }

    if (state === "SAFE") {
      alert = {
        title: "Area Safe",
        location: zone?.name || "Your Area",
        time: "Now",
        level: "Low",
        description: "Conditions are now safe"
      };
    }

    if (!alert) return;

    setAlerts(prev => [alert, ...prev].slice(0, 10));
  };

  const clearAlerts = () => {
    setAlerts([]);
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

  return (
    <View className="flex-1 bg-white">
      <Navbar />

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 110, paddingBottom: 30 }}
      >

        {/* HEADER */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-slate-900">
            Emergency Alerts
          </Text>

          <Text className="text-slate-500">
            {!settings.allNotifications
              ? "Alerts Disabled (Global)"
              : settings.alertsEnabled
              ? "Live zone alerts"
              : "Alerts Disabled"}
          </Text>
        </View>

        {/* TOGGLE */}
        <NotificationToggle
          title="Enable Alerts"
          description="Zone-based emergency alerts"
          icon="alert-outline"
          iconColor="#EF4444"
          isEnabled={settings.allNotifications && settings.alertsEnabled}
          onToggle={() =>
            updateState({
              alertsEnabled: !settings.alertsEnabled,
            })
          }
        />

        {/* STATS + CLEAR BUTTON */}
        <View className="mt-2">
          <AlertStats alerts={alerts} />

          {alerts.length > 0 && (
            <TouchableOpacity onPress={clearAlerts}>
              <Text className="text-red-500 text-right font-semibold mr-2 -mt-2">
                Clear Alerts
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ALERT LIST */}
        {alerts.length === 0 ? (
          <Text className="text-gray-400 text-center mt-10">
            No alerts yet
          </Text>
        ) : (
          alerts.map((alert, index) => (
            <AlertItem key={index} {...alert} />
          ))
        )}

        <StayInformed />
      </ScrollView>
    </View>
  );
};

export default AlertsScreen;
