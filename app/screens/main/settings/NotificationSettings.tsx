import React, { useState } from 'react';
import { View, Text, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';

// Define the shape of your settings to satisfy TypeScript
interface SettingsState {
  alerts: boolean;
  weather: boolean;
  sos: boolean;
  sound: boolean;
}

const NotificationSettings = () => {
  const [settings, setSettings] = useState<SettingsState>({
    alerts: true,
    weather: true,
    sos: true,
    sound: false,
  });

  // The 'keyof SettingsState' ensures the key must be alerts, weather, sos, or sound
  const toggleSwitch = (key: keyof SettingsState) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const options: { id: keyof SettingsState; title: string; sub: string; icon: string }[] = [
    { id: 'alerts', title: 'Emergency Alerts', sub: 'Receive critical flood warnings', icon: 'bell' },
    { id: 'weather', title: 'Weather Updates', sub: 'Get daily weather forecasts', icon: 'cloud' },
    { id: 'sos', title: 'SOS Notifications', sub: 'Alerts for nearby emergencies', icon: 'activity' },
    { id: 'sound', title: 'Sound & Vibration', sub: 'Enable alert sounds', icon: 'volume-2' },
  ];

  return (
    <View className="bg-white border border-slate-100 rounded-[32px] p-5 mb-6 shadow-sm">
      <View className="flex-row items-center mb-4">
        <View className="bg-orange-100 p-3 rounded-2xl">
          <Feather name="bell" size={20} color="#f97316" />
        </View>
        <Text className="ml-3 text-lg font-bold text-slate-800">Notifications</Text>
      </View>

      {options.map((item) => (
        <View key={item.id} className="flex-row items-center justify-between py-4 border-b border-slate-50">
          <View className="flex-1 pr-4">
            <Text className="text-slate-900 font-bold text-base">{item.title}</Text>
            <Text className="text-slate-500 text-xs">{item.sub}</Text>
          </View>
          <Switch
            value={settings[item.id]}
            onValueChange={() => toggleSwitch(item.id)}
            trackColor={{ false: "#e2e8f0", true: "#000000" }}
            thumbColor="#ffffff"
          />
        </View>
      ))}
    </View>
  );
};

export default NotificationSettings;