import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type NotificationType = 'sos' | 'warning' | 'success' | 'info';

const TYPE_CONFIG = {
  sos: { bg: '#FEF2F2', border: '#FEE2E2', icon: 'alert-circle-outline', color: '#EF4444', iconBg: '#FEE2E2' },
  warning: { bg: '#FFFBEB', border: '#FEF3C7', icon: 'alert-triangle-outline', color: '#D97706', iconBg: '#FEF3C7' },
  success: { bg: '#F0FDF4', border: '#DCFCE7', icon: 'check-circle-outline', color: '#10B981', iconBg: '#DCFCE7' },
  info: { bg: '#F8FAFC', border: '#F1F5F9', icon: 'information-outline', color: '#3B82F6', iconBg: '#E2E8F0' },
} as const;

interface Props {
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isUnread: boolean;
}

const NotificationCard = ({ type, title, message, time, isUnread }: Props) => {
  const config = TYPE_CONFIG[type];

  return (
    <View 
      style={{ backgroundColor: config.bg, borderColor: config.border }}
      className="p-5 rounded-[24px] mb-4 border flex-row shadow-sm"
    >
      <View style={{ backgroundColor: config.iconBg }} className="p-3 rounded-2xl mr-4 self-start">
        <MaterialCommunityIcons name={config.icon as any} size={24} color={config.color} />
      </View>
      
      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="font-bold text-[#1E293B] text-base">{title}</Text>
          {isUnread && <View className="w-2.5 h-2.5 bg-[#2563EB] rounded-full" />}
        </View>
        <Text className="text-[#475569] text-sm leading-5 mb-2">{message}</Text>
        <View className="flex-row items-center">
          <MaterialCommunityIcons name="clock-outline" size={14} color="#94A3B8" />
          <Text className="text-[#94A3B8] text-xs ml-1 font-medium">{time}</Text>
        </View>
      </View>
    </View>
  );
};

export default NotificationCard;