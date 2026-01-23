import React, { useMemo } from "react";
import { Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { Feather } from "@expo/vector-icons";

const InfoStatsCard = ({ isEditing }: any) => {
  const { width } = useWindowDimensions();

  const res = useMemo(() => ({
    avatarSize: width * 0.28, // Scalable circle
    titleSize: Math.min(width * 0.06, 24),
    subtitleSize: width * 0.038,
    statValue: width * 0.06,
    statLabel: width * 0.025,
    padding: width * 0.08,
  }), [width]);

  return (
    <View style={{ padding: res.padding }} className="mx-6 bg-white rounded-[40px] border border-[#F1F5F9] shadow-sm items-center mb-8">
      <View className="relative">
        <View 
          style={{ width: res.avatarSize, height: res.avatarSize }} 
          className="bg-[#2563EB] rounded-full items-center justify-center shadow-xl shadow-blue-300 mb-4"
        >
          <Text style={{ fontSize: res.avatarSize * 0.35 }} className="text-white font-bold">JD</Text>
        </View>
        {isEditing && (
          <TouchableOpacity 
            style={{ bottom: res.avatarSize * 0.1, right: 0 }}
            className="absolute bg-[#2563EB] p-2 rounded-full border-2 border-white"
          >
            <Feather name="edit-2" size={14} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={{ fontSize: res.titleSize }} className="font-bold text-[#1E293B]">John Doe</Text>
      <Text style={{ fontSize: res.subtitleSize }} className="text-[#64748B] mb-4">john.doe@example.com</Text>

      <View className="flex-row space-x-3 mb-6">
        <View className="bg-[#EBF3FF] px-4 py-1.5 rounded-lg border border-[#DBEAFE]">
          <Text className="text-[#2563EB] font-bold text-xs">Citizen</Text>
        </View>
        <View className="bg-[#DCFCE7] px-4 py-1.5 rounded-lg border border-[#BBF7D0] flex-row items-center">
          <View className="w-2 h-2 bg-[#22C55E] rounded-full mr-2" /> 
          <Text className="text-[#15803D] font-bold text-xs">Active</Text>
        </View>
      </View>

      <View className="flex-row w-full justify-between px-2">
        <View className="bg-[#F8FAFC] border border-[#F1F5F9] p-4 rounded-3xl items-center flex-1 mr-2">
          <Text style={{ fontSize: res.statValue }} className="text-[#2563EB] font-bold">12</Text>
          <Text style={{ fontSize: res.statLabel }} className="text-[#94A3B8] font-bold uppercase">Days Safe</Text>
        </View>
        <View className="bg-[#F0FDF4] border border-[#DCFCE7] p-4 rounded-3xl items-center flex-1 ml-2">
          <Text style={{ fontSize: res.statValue }} className="text-[#10B981] font-bold">98%</Text>
          <Text style={{ fontSize: res.statLabel }} className="text-[#94A3B8] font-bold uppercase">Safety</Text>
        </View>
      </View>
    </View>
  );
};

export default React.memo(InfoStatsCard);