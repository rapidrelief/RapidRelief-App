import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const PrivacySecurity = () => {
  const [locationSharing, setLocationSharing] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <View className="bg-white border border-slate-100 rounded-[32px] p-5 mb-6 shadow-sm">
      <View className="flex-row items-center mb-4">
        <View className="bg-purple-100 p-3 rounded-2xl">
          <Feather name="shield" size={20} color="#a855f7" />
        </View>
        <Text className="ml-3 text-lg font-bold text-slate-800">Privacy & Security</Text>
      </View>

      {/* Location Toggle */}
      <View className="flex-row items-center justify-between py-4 border-b border-slate-100/50">
        <View className="flex-1 pr-4">
          <Text className="text-slate-900 font-bold">Location Sharing</Text>
          <Text className="text-slate-500 text-xs">Allow emergency contacts to see your location</Text>
        </View>
        <Switch 
          value={locationSharing} 
          onValueChange={setLocationSharing}
          trackColor={{ false: "#e2e8f0", true: "#000000" }}
        />
      </View>

      {/* Password Update */}
      <View className="flex-row items-center justify-between py-4 border-b border-slate-100/50">
        <View className="flex-row items-center flex-1">
          <View className="bg-slate-50 p-2 rounded-lg">
            <Feather name="lock" size={18} color="#64748b" />
          </View>
          <View className="ml-3">
            <Text className="text-slate-800 font-bold">Change Password</Text>
            <Text className="text-slate-500 text-xs">Update your account password</Text>
          </View>
        </View>
        <TouchableOpacity className="bg-white border border-slate-200 px-4 py-1.5 rounded-lg">
          <Text className="text-slate-600 font-semibold text-xs">Update</Text>
        </TouchableOpacity>
      </View>

      {/* 2FA Toggle */}
      <View className="flex-row items-center justify-between py-4">
        <View className="flex-1 pr-4">
          <Text className="text-slate-900 font-bold">Two-Factor Authentication</Text>
          <Text className="text-slate-500 text-xs">Add extra security to your account</Text>
        </View>
        <Switch 
          value={twoFactor} 
          onValueChange={setTwoFactor}
          trackColor={{ false: "#e2e8f0", true: "#000000" }}
        />
      </View>
    </View>
  );
};

export default PrivacySecurity;