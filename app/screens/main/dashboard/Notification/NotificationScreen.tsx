import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import NotificationCard from "./NotificationCard";
import NotificationToggle from "./NotificationToggle";

const NotificationScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [settings, setSettings] = useState({
    all: true,
    emergency: true,
    flood: true,
    system: true,
  });

  const handleNavigation = (screenName: string) => {
    setIsMenuOpen(false);

    // EXACT MAPPING BASED ON YOUR EXPLORER
    const routes: Record<string, string> = {
      Dashboard: "/drawer/dashboard",
      Alerts: "/drawer/AlertPath",
      Settings: "/drawer/settingPath",
      // FIX: Ensure these match the folder 'LiveMap' exactly
      "Live Map": "/drawer/LiveMap",
      Map: "/drawer/LiveMap",
      Profile: "/drawer/Profile/PersonalInfo",
    };

    const path = routes[screenName];

    if (path) {
      // push to the relative route path, not the file system path
      router.push(path as any);
    } else {
      console.warn(`Navigation failed. Sidebar sent: "${screenName}"`);
    }
  };

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <Sidebar
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        currentScreen="Alerts" // This should match one of your keys above
        onNavigate={handleNavigation}
      />

      <Navbar onMenuPress={() => setIsMenuOpen(true)} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 70,
          paddingBottom: 40,
        }}
      >
        {/* HEADER SECTION */}
        <View className="px-6 flex-row items-center justify-between mt-6 mb-6">
          <View className="flex-row items-center">
            <View className="bg-[#3B82F6] p-3 rounded-2xl mr-4 shadow-sm">
              <MaterialCommunityIcons
                name="bell-outline"
                size={28}
                color="white"
              />
            </View>
            <View>
              <Text className="text-2xl font-bold text-[#1E293B]">
                Notifications
              </Text>
              <Text className="text-[#64748B] text-sm font-medium">
                2 unread notifications
              </Text>
            </View>
          </View>
          <TouchableOpacity className="bg-white border border-[#E2E8F0] px-4 py-2 rounded-xl shadow-sm">
            <Text className="text-[#475569] font-bold text-xs">
              Mark all as read
            </Text>
          </TouchableOpacity>
        </View>

        {/* PREFERENCES CARD */}
        <View className="mx-6 bg-white p-6 rounded-[32px] border border-[#F1F5F9] shadow-sm mb-8">
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <Feather name="settings" size={20} color="#64748B" />
              <Text className="font-bold text-lg text-[#1E293B] ml-2">
                Notification Preferences
              </Text>
            </View>
            <View className="bg-[#DCFCE7] px-3 py-1 rounded-lg">
              <Text className="text-[#15803D] font-bold text-[10px] uppercase">
                Enabled
              </Text>
            </View>
          </View>

          <NotificationToggle
            title="All Notifications"
            description="Enable or disable all notifications"
            icon="bell-outline"
            iconColor="#3B82F6"
            isEnabled={settings.all}
            onToggle={() => setSettings({ ...settings, all: !settings.all })}
          />
          <NotificationToggle
            title="Emergency Alerts"
            description="Receive emergency notifications"
            icon="alert-outline"
            iconColor="#EF4444"
            isEnabled={settings.emergency}
            onToggle={() =>
              setSettings({ ...settings, emergency: !settings.emergency })
            }
          />
          <NotificationToggle
            title="Flood Alerts"
            description="Weather and flood warning notifications"
            icon="alert-triangle-outline"
            iconColor="#F59E0B"
            isEnabled={settings.flood}
            onToggle={() =>
              setSettings({ ...settings, flood: !settings.flood })
            }
          />
        </View>

        {/* RECENT NOTIFICATIONS SECTION */}
        <View className="px-6">
          <Text className="font-bold text-xl text-[#1E293B] mb-5 ml-1">
            Recent Notifications
          </Text>

          <NotificationCard
            type="sos"
            isUnread={true}
            title="SOS Alert Received"
            time="5 minutes ago"
            message="New emergency request from Gulberg III area"
          />
          <NotificationCard
            type="warning"
            isUnread={true}
            title="Flood Warning"
            time="15 minutes ago"
            message="Water level rising in Model Town - Stay alert"
          />
          <NotificationCard
            type="success"
            isUnread={false}
            title="Safety Confirmed"
            time="1 hour ago"
            message="You are in a safe zone"
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationScreen;
