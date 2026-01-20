import { Feather } from "@expo/vector-icons";
import React, { memo } from "react";
import { Text, View } from "react-native";

const SosHistory = () => (
  <View className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm mb-10">
    <View className="flex-row items-center mb-6">
      <View className="bg-green-100 p-2 rounded-xl mr-3">
        <Feather name="clock" size={18} color="#10B981" />
      </View>
      <Text className="text-lg font-extrabold text-slate-800">SOS History</Text>
    </View>

    {/* Items */}
    <View className="bg-slate-50 p-4 rounded-2xl mb-3 border border-slate-100">
      <View className="flex-row justify-between mb-2">
        <View className="bg-green-100 px-2 py-0.5 rounded-md">
          <Text className="text-green-700 font-bold text-[10px]">
            Completed
          </Text>
        </View>
        <Text className="text-slate-400 text-[10px]">2 hours ago</Text>
      </View>
      <Text className="text-slate-700 font-bold text-sm">Gulberg III</Text>
      <Text className="text-slate-500 text-xs mt-1">
        Responded by Team Alpha
      </Text>
    </View>
  </View>
);

export default memo(SosHistory);
