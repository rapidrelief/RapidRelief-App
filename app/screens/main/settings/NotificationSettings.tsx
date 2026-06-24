import React from 'react';
import { View, Text, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppSettings } from '@/app/store/useAppSettings';


type SettingKey =
  | "allNotifications"
  | "alertsEnabled"
  | "emergency"
  | "flood"
  | "sos"
  | "weather"
  | "fire"
  | "earthquake"

type Option = 
  {
    id: SettingKey;
    title: string;
    sub: string;
    icon: string;
    disabled?: boolean;
  };
    
    const NotificationSettings = () => {

  const { settings, updateState } = useAppSettings();

  const toggle = (key: SettingKey) => {
    updateState({
      [key]: !settings[key],
    });
  };

  const options: Option[] = [
    {
      id: 'allNotifications',
      title: 'All Notifications',
      sub: 'Master control for entire app',
      icon: 'bell',
    },
    {
      id: 'alertsEnabled',
      title: 'Emergency Alerts',
      sub: 'Flood & zone alerts',
      icon: 'alert-circle',
    },
    {
      id: 'flood',
      title: 'Flood Alerts',
      sub: 'Flood warnings',
      icon: 'droplet',
    },
    {
      id: 'emergency',
      title: 'General Alerts',
      sub: 'Signal / safety updates',
      icon: 'alert-triangle',
    },
    {
      id: 'sos',
      title: 'SOS Alerts',
      sub: 'Emergency nearby alerts',
      icon: 'activity',
    },

    // 🚀 FUTURE FEATURES (disabled for now)
    {
      id: 'weather',
      title: 'Weather Updates',
      sub: 'Coming soon',
      icon: 'cloud',
      disabled: true,
    },
    {
      id: 'fire',
      title: 'Fire Alerts',
      sub: 'Coming soon',
      icon: 'flame',
      disabled: true,
    },
    {
      id: 'earthquake',
      title: 'Earthquake Alerts',
      sub: 'Coming soon',
      icon: 'zap',
      disabled: true,
    },
  ];

  return (
    <View className="bg-white border border-slate-100 rounded-[32px] p-5 mb-6 shadow-sm">

      {/* HEADER */}
      <View className="flex-row items-center mb-4">
        <View className="bg-orange-100 p-3 rounded-2xl">
          <Feather name="bell" size={20} color="#f97316" />
        </View>
        <Text className="ml-3 text-lg font-bold text-slate-800">
          Notifications
        </Text>
      </View>

      {options.map((item) => {

        const isMasterOff = !settings.allNotifications;

        const isDisabled =
          item.disabled ||
          (item.id !== 'allNotifications' && isMasterOff);

        const value = item.disabled
          ? false
          : item.id === 'allNotifications'
            ? settings.allNotifications
            : settings[item.id];

        return (
          <View
            key={item.id}
            className="flex-row items-center justify-between py-4 border-b border-slate-50"
          >
            <View className="flex-1 pr-4">
              <Text className={`font-bold text-base ${isDisabled ? "text-gray-400" : "text-slate-900"}`}>
                {item.title}
              </Text>

              <Text className="text-slate-500 text-xs">
                {item.sub}
              </Text>
            </View>

            <Switch
              value={value}
              disabled={isDisabled}
              onValueChange={() => {
                if (item.id === 'allNotifications') {
                  const newVal = !settings.allNotifications;

                  updateState({
                    allNotifications: newVal,

                    // 🔥 when OFF → force everything OFF
                    ...(newVal === false && {
                      alertsEnabled: false,
                      flood: false,
                      emergency: false,
                      sos: false,
                    }),
                  });

                  return;
                }

                toggle(item.id);
              }}
              trackColor={{ false: "#e2e8f0", true: "#000000" }}
              thumbColor="#ffffff"
            />
          </View>
        );
      })}
    </View>
  );
};

export default NotificationSettings;