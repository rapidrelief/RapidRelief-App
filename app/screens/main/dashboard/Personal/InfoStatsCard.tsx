import React, { useMemo } from "react";
import { Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { Feather } from "@expo/vector-icons";

interface InfoStatsCardProps {
  isEditing: boolean;
  fullName?: string;
  email?: string;
  userLocation?: {
    latitude: number;
    longitude: number;
  } | null;
  zones?: any[];
}

const InfoStatsCard = ({
  isEditing,
  fullName = "",
  email = "",
  userLocation = null,
  zones = [],
}: InfoStatsCardProps) => {
  const { width } = useWindowDimensions();

  const res = useMemo(
    () => ({
      avatarSize: width * 0.28,
      titleSize: Math.min(width * 0.06, 24),
      subtitleSize: Math.min(width * 0.038, 15),
      statValue: width * 0.06,
      statLabel: width * 0.025,
      padding: width * 0.08,
    }),
    [width]
  );

  const getInitials = (name: string) => {
    if (!name.trim()) return "U";

    const nameParts = name.trim().split(" ").filter(Boolean);

    if (nameParts.length === 1) {
      return nameParts[0][0].toUpperCase();
    }

    return (
      nameParts[0][0].toUpperCase() +
      nameParts[1][0].toUpperCase()
    );
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371000;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const getZoneStats = () => {
    if (!userLocation || !zones?.length) {
      return {
        nearbyZonesCount: 0,
        isInDangerZone: false,
        safetyPercentage: 100,
      };
    }

    let nearbyCount = 0;
    let insideDangerZone = false;
    let highestRisk = 0;

    zones.forEach((zone: any) => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        zone.lat,
        zone.lng
      );

      const isInsideZone = distance <= zone.radius_m;
      const isNearbyZone = distance <= zone.radius_m + 1000;

      if (isNearbyZone) {
        nearbyCount++;
      }

      if (isInsideZone) {
        insideDangerZone = true;

        if (zone.state === "FLOOD" || zone.state === "NO_SIGNAL") {
          highestRisk = Math.max(highestRisk, 3);
        } else if (zone.state === "SOS") {
          highestRisk = Math.max(highestRisk, 2);
        } else if (zone.state === "WEAK_SIGNAL") {
          highestRisk = Math.max(highestRisk, 1);
        }
      }
    });

    let safetyPercentage = 100;

    if (insideDangerZone) {
      if (highestRisk === 3) {
        safetyPercentage = 25;
      } else if (highestRisk === 2) {
        safetyPercentage = 50;
      } else if (highestRisk === 1) {
        safetyPercentage = 75;
      }
    } else if (nearbyCount > 0) {
      safetyPercentage = Math.max(80, 100 - nearbyCount * 5);
    }

    return {
      nearbyZonesCount: nearbyCount,
      isInDangerZone: insideDangerZone,
      safetyPercentage,
    };
  };

  const {
    nearbyZonesCount,
    isInDangerZone,
    safetyPercentage,
  } = getZoneStats();

  const getSafetyColor = () => {
    if (safetyPercentage >= 90) {
      return {
        bg: "bg-[#F0FDF4]",
        border: "border-[#DCFCE7]",
        text: "text-[#10B981]",
      };
    }

    if (safetyPercentage >= 70) {
      return {
        bg: "bg-[#FEFCE8]",
        border: "border-[#FEF08A]",
        text: "text-[#CA8A04]",
      };
    }

    return {
      bg: "bg-[#FEF2F2]",
      border: "border-[#FECACA]",
      text: "text-[#EF4444]",
    };
  };

  const safetyColor = getSafetyColor();

  return (
    <View
      style={{ padding: res.padding }}
      className="mx-6 bg-white rounded-[40px] border border-[#F1F5F9] shadow-sm items-center mb-8"
    >
      <View className="relative">
        <View
          style={{ width: res.avatarSize, height: res.avatarSize }}
          className="bg-[#2563EB] rounded-full items-center justify-center shadow-xl shadow-blue-300 mb-4"
        >
          <Text
            style={{ fontSize: res.avatarSize * 0.35 }}
            className="text-white font-bold"
          >
            {getInitials(fullName)}
          </Text>
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

      <Text
        style={{ fontSize: res.titleSize }}
        className="font-bold text-[#1E293B] text-center"
      >
        {fullName || "User"}
      </Text>

      <Text
        style={{ fontSize: res.subtitleSize }}
        className="text-[#64748B] mb-4 text-center"
      >
        {email || "No Email Available"}
      </Text>

      <View className="flex-row space-x-3 mb-6">
        <View className="bg-[#EBF3FF] px-4 py-1.5 rounded-lg border border-[#DBEAFE]">
          <Text className="text-[#2563EB] font-bold text-xs">Citizen</Text>
        </View>

        <View
          className={`px-4 py-1.5 rounded-lg border flex-row items-center ${
            isInDangerZone
              ? "bg-[#FEF2F2] border-[#FECACA]"
              : "bg-[#DCFCE7] border-[#BBF7D0]"
          }`}
        >
          <View
            className={`w-2 h-2 rounded-full mr-2 ${
              isInDangerZone ? "bg-[#EF4444]" : "bg-[#22C55E]"
            }`}
          />
          <Text
            className={`font-bold text-xs ${
              isInDangerZone ? "text-[#DC2626]" : "text-[#15803D]"
            }`}
          >
            {isInDangerZone ? "In Risk Zone" : "Safe Zone"}
          </Text>
        </View>
      </View>

      <View className="flex-row w-full justify-between px-2">
        <View className="bg-[#F8FAFC] border border-[#F1F5F9] p-4 rounded-3xl items-center flex-1 mr-2">
          <Text
            style={{ fontSize: res.statValue }}
            className="text-[#2563EB] font-bold"
          >
            {nearbyZonesCount}
          </Text>
          <Text
            style={{ fontSize: res.statLabel }}
            className="text-[#94A3B8] font-bold uppercase"
          >
            Nearby Zones
          </Text>
        </View>

        <View
          className={`${safetyColor.bg} border ${safetyColor.border} p-4 rounded-3xl items-center flex-1 ml-2`}
        >
          <Text
            style={{ fontSize: res.statValue }}
            className={`${safetyColor.text} font-bold`}
          >
            {safetyPercentage}%
          </Text>
          <Text
            style={{ fontSize: res.statLabel }}
            className="text-[#94A3B8] font-bold uppercase"
          >
            Safety
          </Text>
        </View>
      </View>
    </View>
  );
};

export default React.memo(InfoStatsCard);