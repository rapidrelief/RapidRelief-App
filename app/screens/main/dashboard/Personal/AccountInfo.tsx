import React, { useMemo } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const InfoCard = ({ icon, label, value, color, width }: any) => {
  const textSize = Math.min(width * 0.035, 14);
  
  return (
    <View className="bg-white p-4 rounded-3xl border border-slate-50 mb-3 flex-row items-center shadow-sm">
      <View className={`p-3 rounded-2xl mr-4 ${color}`}>
        {icon}
      </View>
      <View className="flex-1">
        <Text style={{ fontSize: width * 0.025 }} className="text-slate-400 font-bold uppercase">{label}</Text>
        <Text style={{ fontSize: textSize }} className="text-slate-800 font-extrabold">{value}</Text>
      </View>
    </View>
  );
};

const AccountInfo = () => {
  const { width } = useWindowDimensions();
  const headerSize = Math.min(width * 0.045, 18);

  return (
    <View className="px-6 mb-8">
      <Text style={{ fontSize: headerSize }} className="font-extrabold text-[#1E293B] mb-4">Account Information</Text>
      
      <InfoCard 
        width={width} label="Member Since" value="January 15, 2024" color="bg-blue-50"
        icon={<Feather name="calendar" size={18} color="#2563EB" />} 
      />
      <InfoCard 
        width={width} label="Account Status" value="Verified" color="bg-green-50"
        icon={<MaterialCommunityIcons name="shield-check-outline" size={18} color="#10B981" />} 
      />
      <InfoCard 
        width={width} label="User Type" value="Citizen" color="bg-purple-50"
        icon={<Feather name="user" size={18} color="#8B5CF6" />} 
      />
    </View>
  );
};

export default AccountInfo;