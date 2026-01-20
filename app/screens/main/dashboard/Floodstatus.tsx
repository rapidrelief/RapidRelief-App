import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { memo } from "react";
import { Text, View } from "react-native";

const Floodstatus = () => {
  return (
    <View className="bg-[#2563EB] rounded-[30px] p-6 mb-5 shadow-xl shadow-blue-400">
      <View className="flex-row justify-between items-start mb-6">
        <View className="flex-row items-center flex-1">
          <View className="bg-white/20 p-3 rounded-2xl">
            <MaterialCommunityIcons
              name="shield-outline"
              size={28}
              color="white"
            />
          </View>
          <View className="ml-4 flex-1">
            <Text
              className="text-white font-bold text-xl leading-none"
              numberOfLines={1}
            >
              Flood Status
            </Text>
            <Text className="text-blue-100 text-sm mt-1">
              Current Alert Level
            </Text>
          </View>
        </View>

        <View className="bg-white/20 px-4 py-1.5 rounded-full ml-2">
          <Text className="text-white font-bold text-xs tracking-widest uppercase">
            Safe
          </Text>
        </View>
      </View>

      <View className="mb-5">
        <View className="flex-row items-center mb-3">
          <Ionicons name="checkmark-circle-outline" size={22} color="white" />
          <Text className="text-white ml-3 text-base font-medium">
            Your area is currently safe
          </Text>
        </View>

        <View className="flex-row items-center">
          <Ionicons name="location-outline" size={22} color="white" />
          <Text className="text-white ml-3 text-base font-medium">
            Gulberg III, Lahore
          </Text>
        </View>
      </View>

      <View className="h-[1px] bg-white/20 w-full mb-4" />

      <Text className="text-blue-100 text-xs italic">
        Last updated: 2 minutes ago
      </Text>
    </View>
  );
};

export default memo(Floodstatus);
