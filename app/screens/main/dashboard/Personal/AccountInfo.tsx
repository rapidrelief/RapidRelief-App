import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

const InfoCard = ({ icon, label, value, color }: any) => (
  <View className="bg-white p-4 rounded-3xl border border-slate-50 mb-3 flex-row items-center shadow-sm">
    <View className={`p-3 rounded-2xl mr-4 ${color}`}>
      {icon}
    </View>
    <View>
      <Text className="text-slate-400 text-[10px] font-bold uppercase">{label}</Text>
      <Text className="text-slate-800 text-sm font-extrabold">{value}</Text>
    </View>
  </View>
);

export default function AccountInfo() {
  return (
    <View className="px-6 mb-8">
      <Text className="text-lg font-extrabold text-[#1E293B] mb-4">Account Information</Text>
      
      <InfoCard 
        label="Member Since" value="January 15, 2024" color="bg-blue-50"
        icon={<Feather name="calendar" size={18} color="#2563EB" />} 
      />
      
      <InfoCard 
        label="Account Status" value="Verified" color="bg-green-50"
        icon={<MaterialCommunityIcons name="shield-check-outline" size={18} color="#10B981" />} 
      />
      
      <InfoCard 
        label="User Type" value="Citizen" color="bg-purple-50"
        icon={<Feather name="user" size={18} color="#8B5CF6" />} 
      />
    </View>
  );
}