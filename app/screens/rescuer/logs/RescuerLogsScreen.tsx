import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Navbar from "../components/RescuerNavbar";
import { getZoneLogs, getZonesMap } from "@/app/services/api";
import { subscribeToZoneLogs, subscribeToZones } from "@/app/services/realtimeService";

const RescuerLogsScreen = () => {
  const [zones, setZones] = useState<any[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [logs, setLogs] = useState<any>({ events: [], sos: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadZones();

    return subscribeToZones((data) => {
      const list = data?.zones || [];
      setZones(list);
      setSelectedZoneId((current) => current || list[0]?.id || null);
    });
  }, []);

  useEffect(() => {
    if (!selectedZoneId) return;

    loadLogs(selectedZoneId);

    return subscribeToZoneLogs(selectedZoneId, (data) => {
      setLogs(data || { events: [], sos: [] });
      setLoading(false);
    });
  }, [selectedZoneId]);

  const loadZones = async () => {
    const data = await getZonesMap();
    const list = data?.zones || [];
    setZones(list);

    if (!selectedZoneId && list.length > 0) {
      setSelectedZoneId(list[0].id);
    }
  };

  const loadLogs = async (zoneId: number) => {
    try {
      setLoading(true);
      const data = await getZoneLogs(zoneId);
      setLogs(data || { events: [], sos: [] });
    } finally {
      setLoading(false);
    }
  };

  const combinedLogs = [
    ...(logs.events || []).map((item: any) => ({ ...item, source: "SYSTEM" })),
    ...(logs.sos || []).map((item: any) => ({ ...item, source: "SOS" })),
  ].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  return (
    <View className="flex-1 bg-[#F4F6FA]">
      <Navbar />

      <ScrollView contentContainerStyle={{ paddingTop: 100, paddingBottom: 40 }}>
        <View className="px-5">
          <Text className="text-3xl font-extrabold text-gray-900">
            Zone Logs
          </Text>
          <Text className="text-gray-500 mt-1 mb-5">
            Review flood state changes, lost devices, reconnections, and SOS history.
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
            {zones.map((zone) => {
              const active = selectedZoneId === zone.id;
              return (
                <TouchableOpacity
                  key={zone.id}
                  onPress={() => setSelectedZoneId(zone.id)}
                  className={`mr-2 px-4 py-3 rounded-2xl ${active ? "bg-blue-600" : "bg-white"}`}
                >
                  <Text className={active ? "text-white font-bold" : "text-gray-700 font-bold"}>
                    {zone.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xl font-bold text-gray-900">
              History
            </Text>
            <Text className="text-gray-400 text-xs">
              {loading ? "Refreshing..." : "Live updates"}
            </Text>
          </View>

          {combinedLogs.length === 0 ? (
            <Text className="text-gray-400 text-center mt-10">
              No logs for this zone yet
            </Text>
          ) : (
            combinedLogs.map((item, index) => (
              <LogCard key={`${item.source}-${item.id}-${index}`} item={item} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const LogCard = ({ item }: any) => {
  const isSos = item.source === "SOS";

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900">
            {isSos ? "SOS Request" : item.type}
          </Text>
          <Text className="text-gray-400 text-xs mt-1">
            {formatTime(item.timestamp)}
          </Text>
        </View>

        <View className={`px-3 py-1 rounded-full ${isSos ? "bg-red-100" : "bg-blue-100"}`}>
          <Text className={`text-xs font-bold ${isSos ? "text-red-700" : "text-blue-700"}`}>
            {item.source}
          </Text>
        </View>
      </View>

      {isSos ? (
        <View className="mt-3">
          <Text className="text-gray-600">Status: {item.status}</Text>
          <Text className="text-gray-600">Rescuer: {item.rescuer_name || "N/A"}</Text>
          <Text className="text-gray-600">Rescuer ID: {item.rescuer_id || "N/A"}</Text>
        </View>
      ) : (
        <View className="mt-3">
          <Text className="text-gray-600">Device: {item.device_id || "System"}</Text>
          <Text className="text-gray-600">
            Details: {formatDetails(item.details)}
          </Text>
        </View>
      )}
    </View>
  );
};

const formatDetails = (details: any) => {
  if (!details) return "N/A";
  return Object.entries(details)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
};

const formatTime = (timestamp?: number | null) => {
  if (!timestamp) return "Unknown time";
  return new Date(timestamp * 1000).toLocaleString();
};

export default RescuerLogsScreen;
