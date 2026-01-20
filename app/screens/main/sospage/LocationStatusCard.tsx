import { MaterialIcons } from "@expo/vector-icons";
import React, { memo } from "react";
import { Text, View } from "react-native";

const LocationStatusCard = () => {
  return (
    <View className="bg-slate-50 p-5 rounded-[24px] border border-slate-100 mt-4 w-full">
      <Text className="text-[#1E293B] font-bold text-center text-sm md:text-base mb-3">
        Current Location:
      </Text>

      <View className="flex-row items-center justify-center flex-wrap mb-2">
        <MaterialIcons name="location-on" size={18} color="#3B82F6" />
        <Text className="text-[#475569] font-semibold ml-1 text-[14px] text-center">
          Gulberg III, Lahore, Pakistan
        </Text>
      </View>

      <View className="flex-row items-center justify-center">
        <View className="w-2 h-2 rounded-full bg-[#22C55E] mr-2" />
        <Text className="text-[#22C55E] font-bold text-[12px] uppercase tracking-wider">
          Location services active
        </Text>
      </View>
    </View>
  );
};

export default memo(LocationStatusCard);
