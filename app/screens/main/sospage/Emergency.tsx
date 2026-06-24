import React, { memo, useEffect, useState } from "react";
import { Text, View } from "react-native";
import SosButton from "../../../components/SosButton";
import LocationStatusCard from "./LocationStatusCard";
import { auth } from "@/app/config/firebase";
import { getActiveSOS } from "@/app/services/api";
import { subscribeToActiveSOS } from "@/app/services/realtimeService";

const Emergency = () => {
  const [activeSos, setActiveSos] = useState<any | null>(null);

  useEffect(() => {
    const checkActive = (sosList: any[]) => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const userSos = sosList.find(
        (item: any) => item.user_id === uid && item.status === "ACTIVE"
      );
      setActiveSos(userSos || null);
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

  const formatTime = (timestamp?: number | null) => {
    if (!timestamp) return "";
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <View className="bg-white border-2 border-red-50 rounded-[35px] p-7 mb-6 items-center shadow-sm">
      {/* 1. Refined Header Section */}
      <View className="flex-row items-center justify-center gap-2 mb-1">
        <Text className="text-[#1E293B] text-xl font-bold text-center">
          Send Emergency Alert
        </Text>
        {activeSos && (
          <View className="bg-red-500 px-2.5 py-0.5 rounded-full">
            <Text className="text-white text-[10px] font-black uppercase tracking-wider">
              Active
            </Text>
          </View>
        )}
      </View>
      
      {/* 2. Softened Subtitle */}
      <Text className="text-[#64748B] text-center text-[15px] mb-8 px-4 leading-5">
        Press and hold the button below for 3 seconds
      </Text>

      {/* 3. Global SOS Button (Full Scale for SOS Page) */}
      <View className="mb-4">
        <SosButton scale={1} showEmergencyText={true} />
      </View>

      {/* SOS Active Timestamp Line */}
      {activeSos && (
        <View className="mb-4">
          <Text className="text-red-600 font-bold text-sm text-center">
            sos active on {formatTime(activeSos.created_at)}
          </Text>
        </View>
      )}

      {/* 4. Location Details (Integrated) */}
      <LocationStatusCard />

      {/* 5. Footer Hint */}
      <Text className="text-[#94A3B8] font-medium text-sm mt-6">
        Hold for 3 seconds to send emergency alert
      </Text>
    </View>
  );
};

export default memo(Emergency);