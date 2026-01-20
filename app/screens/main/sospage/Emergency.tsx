import React, { memo } from "react";
import { Text, View } from "react-native";
import SosButton from "../../../components/SosButton";
import LocationStatusCard from "./LocationStatusCard";

const Emergency = () => {
  return (
    <View className="bg-white border-2 border-red-50 rounded-[35px] p-7 mb-6 items-center shadow-sm">
      {/* 1. Refined Header Section */}
      <Text className="text-[#1E293B] text-xl font-bold mb-1 text-center">
        Send Emergency Alert
      </Text>
      
      {/* 2. Softened Subtitle */}
      <Text className="text-[#64748B] text-center text-[15px] mb-8 px-4 leading-5">
        Press and hold the button below for 3 seconds
      </Text>

      {/* 3. Global SOS Button (Full Scale for SOS Page) */}
      <View className="mb-4">
        <SosButton scale={1} showEmergencyText={true} />
      </View>

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