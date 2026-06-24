import React from 'react';
import { View, Text, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ToggleProps {
  icon: any;
  title: string;
  description: string;
  isEnabled: boolean;
  onToggle: () => void;
  iconColor: string;
}

const NotificationToggle = ({ icon, title, description, isEnabled, onToggle, iconColor }: ToggleProps) => (
  <View className="flex-row items-center bg-white p-4 rounded-2xl mb-3 border border-slate-100 shadow-sm">
    <View className="p-2 rounded-xl bg-slate-50 mr-4">
      <MaterialCommunityIcons name={icon} size={24} color={iconColor} />
    </View>
    <View className="flex-1">
      <Text className="font-bold text-slate-800 text-base">{title}</Text>
      <Text className="text-slate-500 text-xs mt-0.5">{description}</Text>
    </View>
    <Switch
      value={isEnabled}
      onValueChange={onToggle}
      trackColor={{ false: "#CBD5E1", true: "#2563EB" }}
      thumbColor="#fff"
    />
  </View>
);

export default NotificationToggle;