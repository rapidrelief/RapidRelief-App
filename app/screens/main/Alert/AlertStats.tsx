import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

const StatCard = ({ label, count, icon, color }: any) => (
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

const AlertStats = ({ alerts }: { alerts: any[] }) => {

  // ✅ COMPUTE COUNTS
  const stats = useMemo(() => {
    const critical = alerts.filter(a => a.level === "High").length;
    const warnings = alerts.filter(a => a.level === "Medium").length;
    const total = alerts.length;

    return { critical, warnings, total };
  }, [alerts]);

  return (
    <View className="mb-6">
      <StatCard label="Critical Alerts" count={stats.critical} icon="alert-circle" color="bg-red-600" />
      <StatCard label="Warnings" count={stats.warnings} icon="bell" color="bg-amber-500" />
      <StatCard label="Total Alerts" count={stats.total} icon="info" color="bg-blue-600" />
    </View>
  );
};

export default AlertStats;