import { Feather, MaterialIcons } from "@expo/vector-icons";
import React, { memo } from "react";
import { Text, View } from "react-native";

const TIPS_DATA = [
  {
    id: 1,
    title: "Stay Informed",
    desc: "Monitor weather updates and alerts regularly.",
    icon: "radio",
    bgColor: "bg-blue-50",
    iconColor: "#2563EB",
  },
  {
    id: 2,
    title: "Emergency Kit",
    desc: "Keep essentials: water, food, flashlight, medicines.",
    icon: "briefcase",
    bgColor: "bg-amber-50",
    iconColor: "#D97706",
  },
  {
    id: 3,
    title: "Evacuation Plan",
    desc: "Know your nearest safe zones and routes.",
    icon: "map",
    bgColor: "bg-emerald-50",
    iconColor: "#059669",
  },
  {
    id: 4,
    title: "Share Location",
    desc: "Enable location sharing with emergency contacts.",
    icon: "share-2",
    bgColor: "bg-purple-50",
    iconColor: "#7C3AED",
  },
];

const SafetyTips = () => {
  return (
    <View className="bg-white rounded-[24px] p-5 mb-10 shadow-sm shadow-slate-200/50 border border-slate-100">
      <View className="flex-row items-center mb-5">
        <View className="bg-slate-100 p-2.5 rounded-full mr-3 border border-slate-200/50 shadow-sm">
          <Feather name="shield" size={18} color="#334155" />
        </View>
        <View>
          <Text className="text-slate-800 text-[17px] font-bold">
            Safety Tips
          </Text>
          <Text className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider mt-0.5">
            Disaster Preparedness
          </Text>
        </View>
      </View>

      <View className="gap-y-3">
        {TIPS_DATA.map((tip) => (
          <View
            key={tip.id}
            className="bg-white border border-slate-100 p-4 rounded-[16px] flex-row items-center shadow-sm shadow-slate-100"
          >
            <View
              className={`${tip.bgColor} w-10 h-10 rounded-full items-center justify-center mr-3 shadow-sm`}
            >
              <Feather name={tip.icon as any} size={18} color={tip.iconColor} />
            </View>

            <View className="flex-1">
              <Text className="text-slate-800 font-bold text-[14px] mb-0.5">
                {tip.title}
              </Text>
              <Text className="text-slate-500 text-[12px] leading-tight pr-2">
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
