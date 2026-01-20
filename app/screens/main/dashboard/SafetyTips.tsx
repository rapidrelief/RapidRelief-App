import { Feather } from "@expo/vector-icons";
import React, { memo } from "react";
import { Text, View } from "react-native";

const TIPS_DATA = [
  {
    id: 1,
    title: "Stay Informed",
    desc: "Monitor weather updates and alerts regularly",
    bgColor: "bg-blue-50",
    numBg: "bg-blue-600",
  },
  {
    id: 2,
    title: "Emergency Kit",
    desc: "Keep essentials ready: water, food, flashlight, medicines",
    bgColor: "bg-yellow-50",
    numBg: "bg-yellow-600",
  },
  {
    id: 3,
    title: "Evacuation Plan",
    desc: "Know your nearest safe zones and evacuation routes",
    bgColor: "bg-green-50",
    numBg: "bg-green-600",
  },
  {
    id: 4,
    title: "Share Location",
    desc: "Enable location sharing with emergency contacts",
    bgColor: "bg-purple-50",
    numBg: "bg-purple-600",
  },
];

const SafetyTips = () => {
  return (
    <View className="bg-white border border-gray-100 rounded-[35px] p-6 mb-10 shadow-sm">
      <View className="flex-row items-center mb-6">
        <View className="bg-blue-100 p-2.5 rounded-full">
          <Feather name="info" size={20} color="#2563EB" />
        </View>
        <Text className="ml-3 text-gray-900 text-xl font-bold">
          Safety Tips
        </Text>
      </View>

      <View>
        {TIPS_DATA.map((tip) => (
          <View
            key={tip.id}
            className={`${tip.bgColor} p-4 rounded-2xl flex-row items-start border border-white/50 mb-3`}
          >
            <View
              className={`${tip.numBg} w-6 h-6 rounded-full items-center justify-center mt-0.5`}
            >
              <Text className="text-white text-[10px] font-bold">{tip.id}</Text>
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-gray-900 font-bold text-base">
                {tip.title}
              </Text>
              <Text className="text-gray-500 text-sm mt-0.5 leading-5">
                {tip.desc}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default memo(SafetyTips);
