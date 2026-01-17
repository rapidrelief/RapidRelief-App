import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const InfoStatsCard = ({ isEditing }: any) => (
  <View className="mx-6 bg-white p-8 rounded-[40px] border border-[#F1F5F9] shadow-sm items-center mb-8">
    <View className="relative">
      <View className="w-28 h-28 bg-[#2563EB] rounded-full items-center justify-center shadow-xl shadow-blue-300 mb-4">
        <Text className="text-white text-4xl font-bold">JD</Text>
      </View>
      {isEditing && (
        <TouchableOpacity className="absolute bottom-4 right-0 bg-[#2563EB] p-2 rounded-full border-2 border-white">
          <Feather name="edit-2" size={14} color="white" />
        </TouchableOpacity>
      )}
    </View>

    <Text className="text-2xl font-bold text-[#1E293B]">John Doe</Text>
    <Text className="text-[#64748B] text-base mb-4">john.doe@example.com</Text>

    <View className="flex-row space-x-3 mb-6">
      <View className="bg-[#EBF3FF] px-4 py-1.5 rounded-lg border border-[#DBEAFE]">
        <Text className="text-[#2563EB] font-bold text-xs">Citizen</Text>
      </View>
      <View className="bg-[#DCFCE7] px-4 py-1.5 rounded-lg border border-[#BBF7D0] flex-row items-center">
        {/* FIXED: Changed <div> to <View> */}
        <View className="w-2 h-2 bg-[#22C55E] rounded-full mr-2" /> 
        <Text className="text-[#15803D] font-bold text-xs">Active</Text>
      </View>
    </View>

    <View className="flex-row w-full justify-between px-4">
      <View className="bg-[#F8FAFC] border border-[#F1F5F9] p-4 rounded-3xl items-center flex-1 mr-3">
        <Text className="text-[#2563EB] text-2xl font-bold">12</Text>
        <Text className="text-[#94A3B8] text-[10px] font-bold uppercase">
          Days Safe
        </Text>
      </View>
      <View className="bg-[#F0FDF4] border border-[#DCFCE7] p-4 rounded-3xl items-center flex-1 ml-3">
        <Text className="text-[#10B981] text-2xl font-bold">98%</Text>
        <Text className="text-[#94A3B8] text-[10px] font-bold uppercase">
          Safety
        </Text>
      </View>
    </View>
  </View>
);

export default InfoStatsCard;