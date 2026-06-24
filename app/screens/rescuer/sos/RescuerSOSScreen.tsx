import React, { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, View, Text, ScrollView, TouchableOpacity, Modal } from "react-native";
import Navbar from "../components/RescuerNavbar";
import { clearZoneSOS, getActiveSOS, completeSOS, getSOSHistory } from "@/app/services/api";
import { subscribeToActiveSOS } from "@/app/services/realtimeService";
import { auth, db } from "@/app/config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const RescuerSOSScreen = () => {
  const router = useRouter();
  const [sosList, setSosList] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [clearingZoneId, setClearingZoneId] = useState<number | null>(null);

  const sosItems = sosList.filter((item) => item.source !== "ZONE_FLOOD");
  const floodAlerts = sosList.filter((item) => item.source === "ZONE_FLOOD");

  const loadActiveSOS = async () => {
    const data = await getActiveSOS();
    setSosList(data?.sos || []);
  };

  const loadHistory = async () => {
    const data = await getSOSHistory();
    setHistory(data?.sos || []);
    setHistoryVisible(true);
  };

  const clearZoneAlert = async (zoneId: number) => {
    if (clearingZoneId) return;

    let completedByName = "Rescuer";
    let completedBy = auth.currentUser?.uid || "UNKNOWN";

    try {
      const uid = auth.currentUser?.uid;
      if (uid) {
        const snap = await getDoc(doc(db, "users", uid));
        const data = snap.exists() ? snap.data() : {};
        completedByName = data.fullName || completedByName;
        completedBy = data.rescuerId || uid;
      }
    } catch (err) {
      console.log("Zone clear profile error:", err);
    }

    try {
      setClearingZoneId(zoneId);

      await clearZoneSOS(zoneId, {
        completed_by: completedBy,
        completed_by_name: completedByName,
      });

      await loadActiveSOS();
    } finally {
      setClearingZoneId(null);
    }
  };

  const refreshSOS = async () => {
    try {
      setRefreshing(true);
      await loadActiveSOS();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadActiveSOS();

    return subscribeToActiveSOS((data) => {
      setSosList(data?.sos || []);
    });
  }, []);

  return (
    <View className="flex-1 bg-white">
      <Navbar />

      <ScrollView
        contentContainerStyle={{ paddingTop: 100, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshSOS} />
        }
      >
        <View className="px-5">

          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold">
              Active SOS
            </Text>

            <TouchableOpacity onPress={loadHistory}>
              <Text className="text-blue-600 font-semibold">
                View SOS History
              </Text>
            </TouchableOpacity>
          </View>

          {refreshing && (
            <View className="flex-row items-center justify-center bg-blue-50 border border-blue-100 rounded-2xl py-3 mb-5">
              <ActivityIndicator size="small" color="#2563EB" />
              <Text className="ml-2 text-blue-700 font-semibold">
                Refreshing SOS requests...
              </Text>
            </View>
          )}

          {sosItems.length === 0 && (
            <Text className="text-gray-400 text-center mt-10">
              No active SOS
            </Text>
          )}

          {sosItems.map((sos) =>
            sos.zone_alert ? (
              <ZoneAlertCard
                key={sos.id}
                alert={sos}
                onClear={() => clearZoneAlert(Number(sos.zone_id))}
                clearing={clearingZoneId === Number(sos.zone_id)}
              />
            ) : (
              <View
                key={sos.id}
                className="p-4 bg-red-50 border border-red-100 rounded-2xl mb-4 shadow-sm"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1 pr-3">
                    <Text className="font-bold text-gray-900 text-base">
                      {sos.user_name || sos.rescuer_name || "Unknown User"}
                    </Text>

                    <View className="flex-row items-center mt-1.5 gap-1">
                      <Ionicons name="warning-outline" size={14} color="#EF4444" />
                      <Text className="text-xs text-red-600 font-bold">
                        {sos.source === "AUTO" ? "Automatic/Offline SOS" : "Manual SOS"}
                      </Text>
                    </View>

                    <Text className="text-xs text-gray-500 mt-2 font-semibold">
                      📍 Zone ID: {sos.zone_id || "Outside"} | 🕒 {new Date(sos.created_at * 1000).toLocaleTimeString()}
                    </Text>
                  </View>

                  <View className="bg-red-500 px-3 py-1 rounded-full shadow-sm">
                    <Text className="text-white text-[9px] font-extrabold tracking-wider">
                      ACTIVE
                    </Text>
                  </View>
                </View>

                <View className="flex-row mt-4 gap-3">
                  <TouchableOpacity
                    onPress={() => {
                      router.push({
                        pathname: "/rescuer/map",
                        params: {
                          focusLat: sos.lat,
                          focusLng: sos.lng,
                          focusType: "user",
                          focusId: sos.user_id || sos.id,
                        },
                      });
                    }}
                    className="flex-1 bg-blue-600 py-3 rounded-xl shadow-sm flex-row items-center justify-center gap-2"
                  >
                    <Ionicons name="map-outline" size={14} color="white" />
                    <Text className="text-white text-center text-xs font-extrabold">
                      View on Map
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={async () => {
                      await completeSOS(sos.id);
                      await loadActiveSOS();
                    }}
                    className="flex-1 bg-green-600 py-3 rounded-xl shadow-sm flex-row items-center justify-center gap-2"
                  >
                    <Ionicons name="checkmark-circle-outline" size={14} color="white" />
                    <Text className="text-white text-center text-xs font-extrabold">
                      Mark Safe
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          )}

          {floodAlerts.length > 0 && (
            <View className="mt-6">
              <Text className="text-xl font-bold mb-3">
                Active Flood Alerts
              </Text>

              {floodAlerts.map((alert) => (
                <ZoneAlertCard
                  key={alert.id}
                  alert={alert}
                  onClear={() => {}}
                  clearing={false}
                />
              ))}
            </View>
          )}

        </View>
      </ScrollView>

      <Modal visible={historyVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-5 max-h-[80%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold">
                SOS History
              </Text>

              <TouchableOpacity onPress={() => setHistoryVisible(false)}>
                <Text className="text-red-600 font-bold">Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              {history.length === 0 ? (
                <Text className="text-gray-400 text-center py-8">
                  No SOS history in the last month
                </Text>
              ) : (
                history.map((sos) => (
                  <View
                    key={sos.id}
                    className="bg-gray-50 p-4 rounded-2xl mb-3 border border-gray-100"
                  >
                    <Text className="font-bold">
                      {sos.user_name || sos.rescuer_name || sos.details?.zone_name || "SOS Request"}
                    </Text>

                    <Text>Zone: {sos.zone_id || "N/A"}</Text>
                    <Text>Source: {sos.source || "RESCUER"}</Text>
                    {sos.details && (
                      <Text>
                        Devices: {sos.details.active_devices || 0} active / {sos.details.lost_devices || 0} lost / {sos.details.total_devices || 0} total
                      </Text>
                    )}
                    <Text>Completed: {formatTime(sos.completed_at)}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const ZoneAlertCard = ({ alert, onClear, clearing }: any) => {
  const isSos = alert.source === "ZONE_SOS";
  const label = isSos ? "SOS" : "FLOOD";
  const reportingNodes = alert.reporting_nodes || alert.details?.reporting_nodes || [];
  const reportingGateways = alert.reporting_gateways || alert.details?.reporting_gateways || [];

  return (
    <View
      className={`p-4 rounded-2xl mb-3 border ${
        isSos ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200"
      }`}
    >
      <Text className="font-bold text-lg">
        Zone state changed to {label}
      </Text>

      <Text className="mt-2">Zone: {alert.zone_name || alert.details?.zone_name || alert.zone_id}</Text>
      <Text>State: {alert.state}</Text>
      <Text>Time: {formatTime(alert.created_at)}</Text>
      <Text>Total Devices: {alert.total_devices ?? alert.details?.total_devices ?? 0}</Text>
      <Text>Active Devices: {alert.active_devices ?? alert.details?.active_devices ?? 0}</Text>
      <Text>Lost Devices: {alert.lost_devices ?? alert.details?.lost_devices ?? 0}</Text>
      <Text>
        Devices reporting {label}: {alert.reporting_devices_count ?? alert.details?.reporting_devices_count ?? 0}
      </Text>
      <Text>Node: [{reportingNodes.join(", ")}]</Text>
      <Text>Gateway: [{reportingGateways.join(", ")}]</Text>

      {isSos && (
        <TouchableOpacity
          onPress={onClear}
          disabled={clearing}
          className="mt-3 bg-green-600 py-2 rounded-xl"
        >
          <Text className="text-white text-center font-bold">
            {clearing ? "Clearing..." : "SOS Clear"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const formatTime = (timestamp?: number | null) => {
  if (!timestamp) return "N/A";
  return new Date(timestamp * 1000).toLocaleString();
};

export default RescuerSOSScreen;
