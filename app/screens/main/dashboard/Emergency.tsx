import React, { memo, useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import SosButton from '../../../components/SosButton'; 
import { auth } from '@/app/config/firebase';
import { getActiveSOS } from '@/app/services/api';
import { subscribeToActiveSOS } from '@/app/services/realtimeService';

const Emergency = () => {
  const [isActive, setIsActive] = useState(false);
  const [sosStartTime, setSosStartTime] = useState<number | null>(null);

  useEffect(() => {
    const checkActive = (sosList: any[]) => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      
      const userSos = sosList.find(
        (item: any) => item.user_id === uid && item.status === "ACTIVE"
      );
      
      setIsActive(!!userSos);
      if (userSos && userSos.created_at) {
        setSosStartTime(new Date(userSos.created_at).getTime());
      } else {
        setSosStartTime(null);
      }
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
    <View className={`rounded-[24px] p-5 mb-5 items-center shadow-sm border ${isActive ? 'bg-red-50/80 border-red-200 shadow-red-200/50' : 'bg-white border-red-50 shadow-slate-200/40'}`}>
      <View className="flex-row items-center justify-center gap-2 mb-2">
        <Text className={`text-lg font-bold tracking-tight ${isActive ? 'text-red-800' : 'text-slate-800'}`}>
          Emergency Assistance
        </Text>
        {isActive && (
          <View className="bg-red-600 px-3 py-1 rounded-full shadow-sm shadow-red-200">
            <Text className="text-white text-[10px] font-black uppercase tracking-wider">
              Live Tracker
            </Text>
          </View>
        )}
      </View>
      
      <Text className={`text-center text-[13px] font-medium mb-5 px-4 ${isActive ? 'text-red-700/80' : 'text-slate-500'}`}>
        {isActive ? "Rescue teams have been alerted." : "Hold the button below if you need immediate help"}
      </Text>

      <View className="mb-4">
        <SosButton scale={1} showEmergencyText={false} isActive={isActive} activeStartTime={sosStartTime} />
      </View>

      <Text className={`font-bold text-[10px] uppercase tracking-widest ${isActive ? 'text-red-800/60' : 'text-slate-400'}`}>
        {isActive ? "Stay calm and wait for help" : "Hold for 3s to alert authorities"}
      </Text>
    </View>
  );
};

export default memo(Emergency);