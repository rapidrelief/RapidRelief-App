import React, { memo } from 'react';
import { View, Text } from 'react-native';

const EmergencyHeader = () => {
  return (
    <View className="mb-6">
      <Text className="text-2xl font-bold text-slate-900">Emergency SOS</Text>
      <Text className="text-slate-500 mt-1">Quick access to emergency assistance</Text>
    </View>
  );
};

export default memo(EmergencyHeader);