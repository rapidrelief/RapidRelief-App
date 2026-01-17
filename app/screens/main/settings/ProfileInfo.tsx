import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const InfoRow = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
  <View className="flex-row items-center justify-between py-3 border-b border-slate-50">
    <View className="flex-row items-center flex-1">
      <View className="bg-slate-50 p-2 rounded-lg">
        <Feather name={icon} size={18} color="#64748b" />
      </View>
      <View className="ml-3">
        <Text className="text-xs text-slate-400">{label}</Text>
        <Text className="text-slate-800 font-medium">{value}</Text>
      </View>
    </View>
    <TouchableOpacity className="bg-white border border-slate-200 px-4 py-1.5 rounded-lg">
      <Text className="text-slate-600 font-semibold text-xs">Edit</Text>
    </TouchableOpacity>
  </View>
);

const ProfileInfo = () => (
  <View className="bg-white border border-slate-100 rounded-[32px] p-5 mb-6 shadow-sm">
    <View className="flex-row items-center mb-4">
      <View className="bg-blue-100 p-3 rounded-2xl">
        <Feather name="user" size={20} color="#2563eb" />
      </View>
      <Text className="ml-3 text-lg font-bold text-slate-800">Profile Information</Text>
    </View>
    <InfoRow icon="user" label="Full Name" value="John Doe" />
    <InfoRow icon="phone" label="Phone Number" value="+92 300 1234567" />
    <InfoRow icon="mail" label="Email" value="john.doe@example.com" />
    <InfoRow icon="map-pin" label="Location" value="Gulberg III, Lahore" />
  </View>
);

export default ProfileInfo;