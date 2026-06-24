import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type NotificationType = 'sos' | 'flood' | 'success' | 'info' | 'alert';

const TYPE_CONFIG = {
  sos: { bg: '#FEF2F2', border: '#FEE2E2', icon: 'alert-circle-outline', color: '#EF4444', iconBg: '#FEE2E2' },
  flood: { bg: '#FFFBEB', border: '#FEF3C7', icon: 'alert-circle-outline', color: '#e84a0c', iconBg: '#FEF3C7' },
  success: { bg: '#F0FDF4', border: '#cafcdc', icon: 'check-circle-outline', color: '#10B981', iconBg: '#DCFCE7' },
  info: { bg: '#e3effc', border: '#c1e0ff', icon: 'information-outline', color: '#3B82F6', iconBg: '#dae3ef' },
  alert: { bg: '#f9dede', border: '#d52a0f', icon: 'alert-outline', color: '#df0404', iconBg: '#efcece' },

} as const;

interface Props {
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isUnread: boolean;
}

const NotificationCard = ({ type, title, message, time, isUnread }: Props) => {
  const safeType: NotificationType =
    type && TYPE_CONFIG[type] ? type : "info";

  const config = TYPE_CONFIG[safeType];

  return (
    <View
  style={{
    backgroundColor: config.bg,
    borderColor: config.border,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },

    elevation: 3,
  }}
  className="p-5 rounded-[24px] border flex-row"
>
      <View style={{ backgroundColor: config.iconBg }} className="p-3 rounded-2xl mr-4 self-start">

        <MaterialCommunityIcons name={config.icon as any} size={24} color={config.color} />
      </View>

      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="font-bold text-[#1E293B] text-base">{title}</Text>
          {isUnread && <View className="w-2.5 h-2.5 bg-[#2563EB] rounded-full" />}
        </View>
        {message ? (
          <Text className="text-[#475569] text-sm leading-5 mb-2">
            {message}
          </Text>
        ) : null}
        <View className="flex-row items-center">
          <MaterialCommunityIcons name="clock-outline" size={14} color="#94A3B8" />
          <Text className="text-[#94A3B8] text-xs ml-1 font-medium">{time}</Text>
        </View>
      </View>
    </View>
  );
};

export default NotificationCard;