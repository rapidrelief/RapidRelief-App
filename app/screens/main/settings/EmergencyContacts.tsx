import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // ADD THIS

const ContactCard = ({ type, phone, label, color }: any) => (
  <View className="bg-white p-4 rounded-3xl border border-slate-100 mb-3">
    <View className="flex-row justify-between items-center mb-2">
      <Text className="text-slate-800 font-extrabold">{type}</Text>
      <View className={`px-3 py-1 rounded-lg ${color}`}>
        <Text className="text-[10px] font-bold">{label}</Text>
      </View>
    </View>
    <View className="flex-row items-center">
      <Feather name="phone" size={14} color="#64748B" />
      <Text className="text-slate-600 ml-2 font-semibold">{phone}</Text>
    </View>
  </View>
);

const EmergencyContacts = () => {
  const router = useRouter(); // INITIALIZE ROUTER

  return (
    <View className="mb-6 px-1">
      <View className="flex-row items-center mb-4">
        <View className="bg-blue-100 p-2 rounded-xl mr-3">
          <Feather name="user" size={18} color="#2563EB" />
        </View>
        <Text className="text-lg font-extrabold text-slate-800">Emergency Contacts</Text>
      </View>

      <ContactCard type="Primary Contact" phone="+92 300 1234567" label="Active" color="bg-blue-50 text-blue-600" />
      <ContactCard type="Secondary Contact" phone="+92 321 7654321" label="Backup" color="bg-slate-50 text-slate-600" />

      {/* UPDATED BUTTON */}
      <TouchableOpacity 
        onPress={() => router.push('/drawer/sospath/ManageContacts')}
        className="w-full py-4 border border-slate-200 rounded-2xl items-center mt-2 bg-white active:bg-slate-50"
      >
        <Text className="text-slate-800 font-bold">Manage Contacts</Text>
      </TouchableOpacity>
    </View>
  );
};

export default memo(EmergencyContacts);