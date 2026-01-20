import React, { memo } from 'react';
import { View, Text } from 'react-native';
import SosButton from '../../../components/SosButton'; 

const Emergency = () => {
  return (
    <View className="bg-white border-2 border-red-50 rounded-[35px] p-6 mb-6 items-center shadow-sm">
      <Text className="text-[#1E293B] text-xl font-bold mb-1">
        Emergency Assistance
      </Text>
      
      <Text className="text-[#64748B] text-center text-[15px] mb-6 px-4">
        Press the button below if you need immediate help
      </Text>

      {/* Scaled down for Dashboard context */}
      <View className="mb-4">
        <SosButton scale={1} showEmergencyText={false} />
      </View>

      <Text className="text-[#94A3B8] font-medium text-sm">
        Hold for 3 seconds to send emergency alert
      </Text>
    </View>
  );
};

export default memo(Emergency);