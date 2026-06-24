import React, { memo, useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import SosButton from '../../../components/SosButton'; 
import { auth } from '@/app/config/firebase';
import { getActiveSOS } from '@/app/services/api';
import { subscribeToActiveSOS } from '@/app/services/realtimeService';

const Emergency = () => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const checkActive = (sosList: any[]) => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const userSos = sosList.find(
        (item: any) => item.user_id === uid && item.status === "ACTIVE"
      );
      setIsActive(!!userSos);
    };

    // Initial fetch
    getActiveSOS().then((data) => {
      checkActive(data?.sos || []);
    });

    // Realtime subscription
    return subscribeToActiveSOS((data) => {
      checkActive(data?.sos || []);
    });
  }, []);

  return (
    <View className="bg-white border-2 border-red-50 rounded-[35px] p-6 mb-6 items-center shadow-sm">
      <View className="flex-row items-center justify-center gap-2 mb-1">
        <Text className="text-[#1E293B] text-xl font-bold">
          Emergency Assistance
        </Text>
        {isActive && (
          <View className="bg-red-500 px-2.5 py-0.5 rounded-full">
            <Text className="text-white text-[10px] font-black uppercase tracking-wider">
              Active
            </Text>
          </View>
        )}
      </View>
      
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