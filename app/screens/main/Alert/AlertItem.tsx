import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

const AlertItem = ({ title, location, time, description, level }: any) => {
  // Logic to determine colors based on the level prop
  const colors = {
    High: { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-600', icon: 'bg-red-600' },
    Medium: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600', icon: 'bg-amber-600' },
    Low: { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-600', icon: 'bg-green-600' }
  }[level as 'High' | 'Medium' | 'Low'] || { bg: 'bg-gray-50', border: 'border-gray-100', text: 'text-gray-600', icon: 'bg-gray-600' };

  return (
    <View className={`${colors.bg} ${colors.border} border p-5 rounded-[30px] mb-4 shadow-sm`}>
      <View className="flex-row justify-between items-start mb-3">
        <View className={`${colors.icon} p-3 rounded-2xl`}>
          <Feather name={level === 'High' ? "alert-circle" : "bell"} size={20} color="white" />
        </View>
        <View className={`${colors.bg} border ${colors.border} px-3 py-1 rounded-lg`}>
          <Text className={`${colors.text} text-[10px] font-bold`}>{level}</Text>
        </View>
      </View>
      
      <Text className="text-xl font-bold text-slate-900 mb-1">{title}</Text>
      <Text className="text-slate-500 text-xs mb-3">{location} • {time}</Text>
      <Text className="text-slate-600 text-sm leading-5">{description}</Text>
    </View>
  );
};

export default AlertItem;