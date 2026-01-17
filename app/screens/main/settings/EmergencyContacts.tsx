import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const ContactCard = ({ type, name, phone, isPrimary }: any) => (
  <View className={`p-4 rounded-2xl mb-3 border ${isPrimary ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
    <View className="flex-row justify-between items-center">
      <View>
        <Text className="text-slate-900 font-bold">{type}: {name}</Text>
        <Text className="text-slate-500 text-sm">{phone}</Text>
      </View>
      <TouchableOpacity>
        <Text className="text-red-500 font-semibold text-xs">Remove</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const EmergencyContacts = () => (
  <View className="bg-white border border-slate-100 rounded-[32px] p-5 mb-6 shadow-sm">
    <View className="flex-row items-center justify-between mb-4">
      <View className="flex-row items-center">
        <View className="bg-red-100 p-3 rounded-2xl">
          <Feather name="phone-call" size={20} color="#ef4444" />
        </View>
        <Text className="ml-3 text-lg font-bold text-slate-800">Emergency Contacts</Text>
      </View>
      <TouchableOpacity className="border border-slate-200 px-3 py-1.5 rounded-lg">
        <Text className="text-slate-600 text-xs font-bold">Add New</Text>
      </TouchableOpacity>
    </View>
    <ContactCard type="Primary" name="Sarah Doe" phone="+92 300 9876543" isPrimary />
    <ContactCard type="Secondary" name="Mike Smith" phone="+92 301 1234567" />
  </View>
);

export default EmergencyContacts;