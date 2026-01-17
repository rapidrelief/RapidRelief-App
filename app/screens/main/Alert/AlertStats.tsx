import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

const StatCard = ({ label, count, icon, color }: { label: string, count: string, icon: any, color: string }) => (
  <View className={`${color} p-4 rounded-3xl flex-row justify-between items-center mb-3 shadow-md`}>
    <View>
      <Text className="text-white/80 text-xs font-semibold">{label}</Text>
      <Text className="text-white text-3xl font-bold">{count}</Text>
    </View>
    <View className="bg-white/20 p-3 rounded-2xl">
      <Feather name={icon} size={24} color="white" />
    </View>
  </View>
);

const AlertStats = () => (
  <View className="mb-6">
    <StatCard label="Critical Alerts" count="2" icon="alert-circle" color="bg-red-600" />
    <StatCard label="Warnings" count="1" icon="bell" color="bg-amber-500" />
    <StatCard label="Total Alerts" count="5" icon="info" color="bg-blue-600" />
  </View>
);

export default AlertStats;