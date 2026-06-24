import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { completeSOS, createSOS, getActiveSOS, getSOSHistory, getZonesMap } from "@/app/services/api";
import { subscribeToActiveSOS, subscribeToZones } from "@/app/services/realtimeService";
import Navbar from "../components/RescuerNavbar";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

// Firebase
import { auth, db } from "@/app/config/firebase";
import { collection, doc, getDoc, getDocs, onSnapshot, updateDoc } from "firebase/firestore";

type Zone = {
  id: string;
  name: string;
  state: "FLOOD" | "SAFE" | "NO_SIGNAL" | "WEAK_SIGNAL" | "SOS";
};

const RescuerDashboard = () => {
  const router = useRouter();

  const [zones, setZones] = useState<Zone[]>([]);
  const [showAll, setShowAll] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  const [nearbyRescuers, setNearbyRescuers] = useState<any[]>([]);
  const [loadingRescuers, setLoadingRescuers] = useState(true);
  const [rescueRequests, setRescueRequests] = useState<any[]>([]);
  const [activeSosCount, setActiveSosCount] = useState(0);
  const [rescueHistory, setRescueHistory] = useState<any[]>([]);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [activeFloods, setActiveFloods] = useState<any[]>([]);
  const [selectedFlood, setSelectedFlood] = useState<any | null>(null);
  const [floodModalVisible, setFloodModalVisible] = useState(false);
  const [floodHistory, setFloodHistory] = useState<any[]>([]);
  const [floodHistoryVisible, setFloodHistoryVisible] = useState(false);

  const holdTimer = useRef<any>(null);
  const rescuerDocsRef = useRef<any[]>([]);
  const rescuerCoordsRef = useRef<any>(null);

  // ================= LOAD ZONES =================
  useEffect(() => {
    getZonesMap().then((data) => setZones(data?.zones || []));

    return subscribeToZones((data) => {
      setZones(data?.zones || []);
    });
  }, []);

  // ================= LOAD USER SOS REQUESTS =================
  useEffect(() => {
    getActiveSOS().then((data) => {
      const sosItems = (data?.sos || []).filter((item: any) => item.source !== "ZONE_FLOOD");
      setActiveSosCount(sosItems.length);
      const list = (data?.sos || []).filter((item: any) =>
        item.source === "USER" || item.source === "AUTO"
      );
      setRescueRequests(list);

      const floods = (data?.sos || []).filter((item: any) => item.source === "ZONE_FLOOD");
      setActiveFloods(floods);
    });

    return subscribeToActiveSOS((data) => {
      const sosItems = (data?.sos || []).filter((item: any) => item.source !== "ZONE_FLOOD");
      setActiveSosCount(sosItems.length);
      const list = (data?.sos || []).filter((item: any) =>
        item.source === "USER" || item.source === "AUTO"
      );
      setRescueRequests(list);

      const floods = (data?.sos || []).filter((item: any) => item.source === "ZONE_FLOOD");
      setActiveFloods(floods);
    });
  }, []);

  const loadHistory = async () => {
    const data = await getSOSHistory();
    setRescueHistory(data?.sos || []);
    setHistoryVisible(true);
  };

  // ================= LOAD RESCUERS =================
  useEffect(() => {
    let unsubscribe: any;

    const start = async () => {
      try {
        setLoadingRescuers(true);
        rescuerCoordsRef.current = await updateMyRescuerLocation();

        unsubscribe = onSnapshot(
          collection(db, "users"),
          (snap) => {
            rescuerDocsRef.current = snap.docs.map((userDoc) => ({
              id: userDoc.id,
              data: userDoc.data(),
            }));

            setNearbyRescuers(
              buildRescuerList(rescuerDocsRef.current, rescuerCoordsRef.current)
            );
            setLoadingRescuers(false);
          },
          (err) => {
            console.log("Realtime rescuer fetch error:", err);
            loadRescuers();
          }
        );
      } catch (err) {
        console.log("Rescuer realtime setup error:", err);
        loadRescuers();
      }
    };

    start();

    const interval = setInterval(async () => {
      rescuerCoordsRef.current = await updateMyRescuerLocation();
      setNearbyRescuers(
        buildRescuerList(rescuerDocsRef.current, rescuerCoordsRef.current)
      );
    }, 50000);

    return () => {
      clearInterval(interval);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loadRescuers = async () => {
    try {
      setLoadingRescuers(true);

      const currentCoords = await updateMyRescuerLocation();
      rescuerCoordsRef.current = currentCoords;
      const snap = await getDocs(collection(db, "users"));

      rescuerDocsRef.current = snap.docs.map((userDoc) => ({
        id: userDoc.id,
        data: userDoc.data(),
      }));

      setNearbyRescuers(buildRescuerList(rescuerDocsRef.current, currentCoords));
    } catch (err) {
      console.log("Rescuer fetch error:", err);
    } finally {
      setLoadingRescuers(false);
    }
  };

  const updateMyRescuerLocation = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return null;

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return null;

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const coords = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      lat: loc.coords.latitude,
      lng: loc.coords.longitude,
      updatedAt: Date.now(),
    };

    await updateDoc(doc(db, "users", uid), {
      location: coords,
    });

    return coords;
  };

  // ================= STATUS STYLE =================
  const getStatusStyle = (state: string) => {
    switch (state) {
      case "FLOOD":
        return "bg-red-500";
      case "SOS":
        return "bg-pink-500";
      case "NO_SIGNAL":
        return "bg-gray-500";
      case "WEAK_SIGNAL":
        return "bg-yellow-500";
      case "LOST":
        return "bg-orange-500";
      default:
        return "bg-emerald-500";
    }
  };

  const visibleZones = showAll ? zones : zones.slice(0, 6);

  // ================= SOS =================
  const handlePressIn = () => {
    holdTimer.current = setTimeout(() => {
      setModalVisible(true);
    }, 3000);
  };

  const handlePressOut = () => {
    clearTimeout(holdTimer.current);
  };

  const sendSOS = async () => {
    if (!selectedZone) return;

    let rescuerName = "Rescuer";
    let rescuerId = auth.currentUser?.uid || "UNKNOWN";

    try {
      const uid = auth.currentUser?.uid;
      if (uid) {
        const snap = await getDoc(doc(db, "users", uid));
        const data = snap.exists() ? snap.data() : {};
        rescuerName = data.fullName || rescuerName;
        rescuerId = data.rescuerId || uid;
      }
    } catch (err) {
      console.log("Rescuer profile fetch error:", err);
    }

    await createSOS({
      zone_id: selectedZone.id,
      source: "RESCUER",
      rescuer_id: rescuerId,
      rescuer_name: rescuerName,
    });

    setModalVisible(false);
    setSelectedZone(null);
  };

  const markRescued = async (requestId: number) => {
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
      console.log("Rescuer completion profile error:", err);
    }

    await completeSOS(requestId, {
      completed_by: completedBy,
      completed_by_name: completedByName,
    });

    const data = await getActiveSOS();
    const list = (data?.sos || []).filter((item: any) =>
      item.source === "USER" || item.source === "AUTO"
    );
    setRescueRequests(list);
  };

  const openRescueOnMap = (request: any) => {
    router.push({
      pathname: "/rescuer/map",
      params: {
        sos: JSON.stringify(request),
        t: Date.now().toString(),
      },
    });
  };

  const openRescuerOnMap = (rescuer: any) => {
    if (!rescuer.location) return;

    router.push({
      pathname: "/rescuer/map",
      params: {
        rescuer: JSON.stringify({
          id: rescuer.id,
          name: rescuer.name,
          status: rescuer.status,
          lat: rescuer.location.latitude,
          lng: rescuer.location.longitude,
          distanceKm: rescuer.distanceKm,
          isMe: rescuer.isMe,
        }),
        t: Date.now().toString(),
      },
    });
  };

  const refreshDashboard = async () => {
    try {
      setRefreshing(true);

      const [zonesData, sosData] = await Promise.all([
        getZonesMap(),
        getActiveSOS(),
        loadRescuers(),
      ]);

      setZones(zonesData?.zones || []);

      const list = (sosData?.sos || []).filter((item: any) =>
        item.source === "USER" || item.source === "AUTO"
      );
      const sosItems = (sosData?.sos || []).filter((item: any) => item.source !== "ZONE_FLOOD");
      setActiveSosCount(sosItems.length);
      setRescueRequests(list);

      const floods = (sosData?.sos || []).filter((item: any) => item.source === "ZONE_FLOOD");
      setActiveFloods(floods);
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewOnMap = () => {
    if (!selectedFlood) return;
    setFloodModalVisible(false);

    const targetZone = zones.find((z) => Number(z.id) === Number(selectedFlood.zone_id));
    if (targetZone) {
      router.push({
        pathname: "/rescuer/map",
        params: {
          zone: JSON.stringify(targetZone),
          t: Date.now().toString(),
        },
      });
    } else {
      router.push({
        pathname: "/rescuer/map",
        params: {
          zone: JSON.stringify({
            id: selectedFlood.zone_id,
            name: selectedFlood.zone_name,
            lat: selectedFlood.lat || 24.8607,
            lng: selectedFlood.lng || 67.0011,
          }),
          t: Date.now().toString(),
        },
      });
    }
    setSelectedFlood(null);
  };

  const loadFloodHistory = async () => {
    const data = await getSOSHistory();
    const list = (data?.sos || []).filter((item: any) => item.source === "ZONE_FLOOD");
    setFloodHistory(list);
    setFloodHistoryVisible(true);
  };

  const formatDuration = (start: number, end: number) => {
    const diffSeconds = end - start;
    if (diffSeconds < 60) return `${Math.round(diffSeconds)}s`;
    const diffMinutes = Math.round(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m`;
    const diffHours = Math.floor(diffMinutes / 60);
    const remMinutes = diffMinutes % 60;
    return `${diffHours}h ${remMinutes}m`;
  };

  // ================= UI =================
  return (
    <View className="flex-1 bg-[#F5F7FB]">
      <Navbar />

      <ScrollView
        contentContainerStyle={{ paddingTop: 100, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshDashboard} colors={["#2563EB"]} />
        }
      >
        <View className="px-5">

          {/* ================= HEADER ================= */}
          <View className="mb-6">
            <Text className="text-3xl font-black text-gray-900 tracking-tight">
              Dashboard
            </Text>
            <Text className="text-gray-500 mt-1 font-semibold text-sm">
              Real-time monitoring and emergency management
            </Text>
          </View>

          {refreshing && (
            <View className="flex-row items-center justify-center bg-blue-50 border border-blue-100 rounded-2xl py-3 mb-6 shadow-sm">
              <ActivityIndicator size="small" color="#2563EB" />
              <Text className="ml-2 text-blue-700 font-extrabold text-sm">
                Syncing system data...
              </Text>
            </View>
          )}

          {/* ================= ZONES GRID SECTION ================= */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-xl font-bold text-gray-900 tracking-tight">
                Zone Coverage
              </Text>
              <Text className="text-xs text-gray-400 font-bold">
                {zones.length} {zones.length === 1 ? "Zone" : "Zones"} total
              </Text>
            </View>

            {zones.length === 0 ? (
              <View className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm items-center">
                <Ionicons name="map-outline" size={40} color="#94A3B8" />
                <Text className="text-gray-400 font-bold mt-3">No zones available</Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap justify-between">
                {visibleZones.map((zone) => (
                  <TouchableOpacity
                    key={zone.id}
                    onPress={() =>
                      router.push({
                        pathname: "/rescuer/map",
                        params: {
                          zone: JSON.stringify(zone),
                          t: Date.now().toString(),
                        },
                      })
                    }
                    className="w-[48%] bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100"
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="font-bold text-sm text-gray-800 flex-1 pr-1" numberOfLines={1}>
                        {zone.name}
                      </Text>
                      <View className={`w-2 h-2 rounded-full ${getStatusDot(zone.state)}`} />
                    </View>

                    <View className={`px-2 py-0.5 rounded-md self-start ${getStatusBg(zone.state)}`}>
                      <Text className={`text-[9px] font-extrabold tracking-wider text-center ${getStatusText(zone.state)}`}>
                        {zone.state}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {zones.length > 6 && (
              <TouchableOpacity
                onPress={() => setShowAll(!showAll)}
                className="mt-2 py-2.5 bg-white rounded-2xl border border-gray-200 shadow-sm flex-row items-center justify-center gap-2"
              >
                <Text className="text-blue-600 text-sm font-bold">
                  {showAll ? "Show Less" : "Show More"}
                </Text>
                <Ionicons name={showAll ? "chevron-up" : "chevron-down"} size={14} color="#2563EB" />
              </TouchableOpacity>
            )}
          </View>

          {/* ================= EMERGENCY SOS RADAR SECTION ================= */}
          <View className="mb-6 bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <View className="flex-row justify-between items-center mb-5 border-b border-gray-50 pb-3">
              <Text className="text-xl font-bold text-gray-900 tracking-tight">
                Emergency Dispatch
              </Text>

              <TouchableOpacity
                onPress={() => router.push("/rescuer/sos")}
                className="flex-row items-center bg-red-50 border border-red-100 rounded-full px-3 py-1.5"
              >
                <Text className="text-red-700 font-extrabold text-xs">
                  View Requests
                </Text>
                {activeSosCount > 0 && (
                  <View className="ml-2 min-w-[18px] h-[18px] rounded-full bg-red-600 items-center justify-center px-1">
                    <Text className="text-white text-[10px] font-black">
                      {activeSosCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View className="items-center py-4">
              <View className="w-52 h-52 rounded-full bg-red-50 items-center justify-center border border-red-100 shadow-inner">
                <View className="w-44 h-44 rounded-full bg-red-100 items-center justify-center">
                  <TouchableOpacity
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={0.9}
                    className="w-36 h-36 bg-red-600 rounded-full items-center justify-center shadow-lg active:bg-red-700"
                    style={{
                      shadowColor: "#EF4444",
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.4,
                      shadowRadius: 10,
                      elevation: 8,
                    }}
                  >
                    <Ionicons name="alert-circle" size={40} color="white" />
                    <Text className="text-white text-2xl font-black mt-1 tracking-wider">
                      SOS
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text className="text-gray-500 mt-5 text-center text-sm font-semibold">
                Hold button for 3 seconds to broadcast SOS alert
              </Text>
            </View>
          </View>

          {/* ================= ACTIVE FLOODS WARNINGS ================= */}
          <View className="mb-6 bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <View className="flex-row justify-between items-center mb-4 border-b border-gray-50 pb-3">
              <Text className="text-xl font-bold text-gray-900 tracking-tight">
                Active Flood Signals
              </Text>
              <TouchableOpacity onPress={loadFloodHistory}>
                <Text className="text-blue-600 font-bold text-sm">
                  View History
                </Text>
              </TouchableOpacity>
            </View>

            {activeFloods.length === 0 ? (
              <View className="items-center py-6">
                <Ionicons name="shield-checkmark" size={32} color="#10B981" />
                <Text className="text-gray-400 font-bold mt-2 text-sm">
                  No active floods detected
                </Text>
              </View>
            ) : (
              activeFloods.map((flood) => {
                const reportingCount = flood.reporting_devices_count ?? flood.details?.reporting_devices_count ?? 0;
                return (
                  <TouchableOpacity
                    key={flood.id}
                    onPress={() => {
                      setSelectedFlood(flood);
                      setFloodModalVisible(true);
                    }}
                    className="py-4 px-4 bg-orange-50 border border-orange-100 rounded-2xl mb-3 flex-row justify-between items-center"
                  >
                    <View className="flex-1 pr-3">
                      <View className="flex-row items-center flex-wrap gap-2">
                        <View className="bg-orange-100 px-2 py-0.5 rounded-md">
                          <Text className="text-orange-700 text-[9px] font-extrabold uppercase tracking-wider">
                            Flood Active
                          </Text>
                        </View>
                        <Text className="font-bold text-gray-900 text-base">
                          {flood.zone_name || flood.details?.zone_name || `Zone ${flood.zone_id}`}
                        </Text>
                      </View>
                      <Text className="text-xs text-gray-500 mt-2 font-semibold">
                        📡 Reporting: <Text className="text-gray-800 font-bold">{reportingCount}</Text> {reportingCount === 1 ? "device" : "devices"}
                      </Text>
                    </View>
                    <View className="w-8 h-8 rounded-full bg-white items-center justify-center border border-orange-100 shadow-sm">
                      <Ionicons name="chevron-forward" size={16} color="#F97316" />
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* ================= RESCUE NEEDED USERS PANEL ================= */}
          <View className="mb-6 bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <View className="flex-row justify-between items-center mb-5 border-b border-gray-50 pb-3">
              <Text className="text-xl font-bold text-gray-900 tracking-tight">
                Rescue Request Feed
              </Text>

              <TouchableOpacity onPress={loadHistory}>
                <Text className="text-blue-600 font-bold text-sm">
                  View History
                </Text>
              </TouchableOpacity>
            </View>

            {rescueRequests.length === 0 ? (
              <View className="items-center py-6">
                <Ionicons name="people-outline" size={32} color="#94A3B8" />
                <Text className="text-gray-400 font-bold mt-2 text-sm">
                  No pending user alerts
                </Text>
              </View>
            ) : (
              rescueRequests.map((request) => (
                <View
                  key={request.id}
                  className="p-4 bg-red-50 border border-red-100 rounded-2xl mb-4 shadow-sm"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 pr-3">
                      <Text className="font-bold text-gray-900 text-base">
                        {request.user_name || "Unknown User"}
                      </Text>

                      <View className="flex-row items-center mt-1.5 gap-1">
                        <Ionicons name="warning-outline" size={14} color="#EF4444" />
                        <Text className="text-xs text-red-600 font-bold">
                          {request.source === "AUTO" ? "Automatic no-movement SOS" : "Manual SOS"}
                        </Text>
                      </View>

                      <Text className="text-xs text-gray-500 mt-2 font-semibold">
                        📍 Zone ID: {request.zone_id || "Outside"} | 🕒 {formatTime(request.created_at)}
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
                      onPress={() => openRescueOnMap(request)}
                      className="flex-1 bg-blue-600 py-3 rounded-xl shadow-sm flex-row items-center justify-center gap-2"
                    >
                      <Ionicons name="map-outline" size={14} color="white" />
                      <Text className="text-white text-center text-xs font-extrabold">
                        View on Map
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => markRescued(request.id)}
                      className="flex-1 bg-green-600 py-3 rounded-xl shadow-sm flex-row items-center justify-center gap-2"
                    >
                      <Ionicons name="checkmark-circle-outline" size={14} color="white" />
                      <Text className="text-white text-center text-xs font-extrabold">
                        Rescued
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* ================= NEARBY TEAM ROSTER ================= */}
          <View className="mb-6 bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <View className="flex-row justify-between items-center mb-5 border-b border-gray-50 pb-3">
              <Text className="text-xl font-bold text-gray-900 tracking-tight">
                Nearby Team Status
              </Text>

              <TouchableOpacity
                onPress={loadRescuers}
                className="w-9 h-9 rounded-full bg-blue-50 items-center justify-center"
              >
                <Ionicons name="refresh" size={18} color="#2563EB" />
              </TouchableOpacity>
            </View>

            {loadingRescuers ? (
              <ActivityIndicator size="small" color="#2563EB" className="py-6" />
            ) : (
              nearbyRescuers.map((r) => {
                const hasLocation = Boolean(r.location);
                const isOnline = r.status?.toLowerCase() === "active" || r.status?.toLowerCase() === "online";

                return (
                  <View
                    key={r.id}
                    className="py-3 px-4 bg-gray-50 border border-gray-100 rounded-2xl mb-3 flex-row justify-between items-center"
                  >
                    <View className="flex-1 pr-3">
                      <View className="flex-row items-center gap-2">
                        <View className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`} />
                        <Text className="font-bold text-gray-800 text-sm">
                          {r.name} {r.isMe ? "(You)" : ""}
                        </Text>
                      </View>

                      <Text className="text-xs text-gray-500 mt-1 font-semibold">
                        Status: <Text className="text-gray-800">{r.status}</Text> {r.distanceKm !== null ? `| 📍 ${r.distanceKm.toFixed(2)} km away` : " | No location"}
                      </Text>
                    </View>

                    <TouchableOpacity
                      disabled={!hasLocation}
                      onPress={() => openRescuerOnMap(r)}
                      className={`px-4 py-2 rounded-xl flex-row items-center gap-2 shadow-sm ${
                        hasLocation ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    >
                      <Ionicons name="navigate-outline" size={14} color={hasLocation ? "white" : "#94A3B8"} />
                      <Text className={`text-xs font-bold ${hasLocation ? "text-white" : "text-gray-400"}`}>
                        Locate
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>

        </View>
      </ScrollView>

      {/* ================= SELECT ZONE FOR SOS MODAL ================= */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 shadow-xl border-t border-gray-100 max-h-[85%]">
            <Text className="text-xl font-bold mb-4 text-center text-gray-900 tracking-tight">
              Select Zone for SOS
            </Text>

            <ScrollView className="max-h-64 mb-3" showsVerticalScrollIndicator={false}>
              {zones.map((z) => (
                <TouchableOpacity
                  key={z.id}
                  onPress={() => setSelectedZone(z)}
                  className={`p-4 rounded-2xl mb-3 border flex-row justify-between items-center ${
                    selectedZone?.id === z.id
                      ? "bg-blue-50 border-blue-300"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <View>
                    <Text className="font-bold text-gray-800 text-sm">
                      {z.name}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1 font-semibold">
                      State: {z.state}
                    </Text>
                  </View>
                  <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                    selectedZone?.id === z.id ? "border-blue-600 bg-blue-600" : "border-gray-300"
                  }`}>
                    {selectedZone?.id === z.id && <View className="w-2 h-2 rounded-full bg-white" />}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={sendSOS}
              disabled={!selectedZone}
              className={`p-4 rounded-2xl mt-4 shadow-sm flex-row justify-center items-center gap-2 ${
                selectedZone ? "bg-red-600" : "bg-gray-300"
              }`}
            >
              <Ionicons name="megaphone-outline" size={18} color="white" />
              <Text className="text-white text-center font-extrabold text-base">
                Broadcast SOS
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setSelectedZone(null);
              }}
              className="bg-gray-100 p-4 rounded-2xl mt-3"
            >
              <Text className="text-gray-700 text-center font-bold text-base">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= RESCUE HISTORY MODAL ================= */}
      <Modal visible={historyVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%] shadow-xl border-t border-gray-100">
            <View className="flex-row justify-between items-center mb-5 border-b border-gray-100 pb-3">
              <Text className="text-xl font-bold text-gray-900 tracking-tight">
                Rescue Alerts History
              </Text>

              <TouchableOpacity onPress={() => setHistoryVisible(false)} className="p-1">
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {rescueHistory.length === 0 ? (
                <View className="items-center py-10">
                  <Ionicons name="time-outline" size={40} color="#94A3B8" />
                  <Text className="text-gray-400 font-semibold mt-3 text-center">
                    No rescue history recorded
                  </Text>
                </View>
              ) : (
                rescueHistory.map((item) => (
                  <View
                    key={item.id}
                    className="bg-gray-50 p-4 rounded-2xl mb-3 border border-gray-100 shadow-sm"
                  >
                    <View className="flex-row justify-between items-start">
                      <Text className="font-bold text-gray-900 text-base">
                        {item.user_name || item.rescuer_name || "SOS Request"}
                      </Text>
                      <View className="bg-green-50 border border-green-100 px-2.5 py-0.5 rounded-md">
                        <Text className="text-green-700 text-[9px] font-extrabold tracking-wider">
                          RESOLVED
                        </Text>
                      </View>
                    </View>

                    <View className="h-[1px] bg-gray-100 my-3" />

                    <View className="space-y-1 mt-1">
                      <Text className="text-xs text-gray-500 font-semibold">
                        📡 Source: <Text className="text-gray-800 font-bold">{item.source}</Text>
                      </Text>
                      <Text className="text-xs text-gray-500 font-semibold mt-1">
                        📍 Zone ID: <Text className="text-gray-800 font-bold">{item.zone_id || "N/A"}</Text>
                      </Text>
                      <Text className="text-xs text-gray-500 font-semibold mt-1">
                        🕒 Completed: <Text className="text-gray-800 font-bold">{formatTime(item.completed_at)}</Text>
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ================= ACTIVE FLOOD DETAILS MODAL ================= */}
      <Modal visible={floodModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[85%] shadow-xl border-t border-gray-100">
            <View className="flex-row justify-between items-center mb-5 border-b border-gray-100 pb-3">
              <Text className="text-xl font-bold text-gray-900 tracking-tight">
                Flood Alert Details
              </Text>
              <TouchableOpacity onPress={() => {
                setFloodModalVisible(false);
                setSelectedFlood(null);
              }} className="p-1">
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {selectedFlood && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="bg-orange-50 border border-orange-100 rounded-3xl p-5 mb-5 shadow-sm">
                  <Text className="text-orange-800 font-extrabold uppercase text-[10px] tracking-wider mb-1">
                    STATUS: FLOOD ACTIVE
                  </Text>
                  <Text className="text-2xl font-black text-gray-900">
                    {selectedFlood.zone_name || selectedFlood.details?.zone_name || `Zone ${selectedFlood.zone_id}`}
                  </Text>
                  <Text className="text-gray-600 text-sm mt-2 font-medium">
                    Flood detected in this zone's boundaries. Coordinate dispatch operations.
                  </Text>
                </View>

                <View className="mb-5">
                  <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Time of Flood Start
                  </Text>
                  <View className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex-row items-center shadow-sm">
                    <Ionicons name="time-outline" size={20} color="#64748B" />
                    <Text className="text-gray-800 font-bold ml-2">
                      {formatTime(selectedFlood.created_at)}
                    </Text>
                  </View>
                </View>

                <View className="mb-6">
                  <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Devices Reporting Flood
                  </Text>

                  <View className="bg-gray-50 border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <Text className="text-gray-500 font-bold text-sm">
                      Total Devices in Zone: <Text className="text-gray-800 font-extrabold">{selectedFlood.total_devices ?? selectedFlood.details?.total_devices ?? 0}</Text>
                    </Text>
                    <Text className="text-gray-500 font-bold text-sm mt-1.5">
                      Reporting Count: <Text className="text-gray-800 font-extrabold">{selectedFlood.reporting_devices_count ?? selectedFlood.details?.reporting_devices_count ?? 0}</Text>
                    </Text>

                    <View className="h-[1px] bg-gray-200 my-4" />

                    <View className="flex-row justify-between mb-3">
                      <Text className="text-gray-500 font-semibold text-sm">Gateways:</Text>
                      <Text className="text-gray-800 font-extrabold text-sm">
                        {(selectedFlood.reporting_gateways || selectedFlood.details?.reporting_gateways || []).length > 0
                          ? (selectedFlood.reporting_gateways || selectedFlood.details?.reporting_gateways).join(", ")
                          : "None"}
                      </Text>
                    </View>

                    <View className="flex-row justify-between">
                      <Text className="text-gray-500 font-semibold text-sm">Nodes (LoRa):</Text>
                      <Text className="text-gray-800 font-extrabold text-sm">
                        {(selectedFlood.reporting_nodes || selectedFlood.details?.reporting_nodes || []).length > 0
                          ? (selectedFlood.reporting_nodes || selectedFlood.details?.reporting_nodes).join(", ")
                          : "None"}
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleViewOnMap}
                  className="bg-blue-600 p-4 rounded-2xl flex-row justify-center items-center mb-4 shadow-sm"
                >
                  <Ionicons name="map-outline" size={20} color="white" />
                  <Text className="text-white font-extrabold text-base ml-2">
                    View Zone on Map
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setFloodModalVisible(false);
                    setSelectedFlood(null);
                  }}
                  className="bg-gray-100 p-4 rounded-2xl mb-2"
                >
                  <Text className="text-gray-700 text-center font-bold text-base">
                    Close Details
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ================= FLOOD HISTORY MODAL ================= */}
      <Modal visible={floodHistoryVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%] shadow-xl border-t border-gray-100">
            <View className="flex-row justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <Text className="text-xl font-bold text-gray-900 tracking-tight">
                Flood Alerts History
              </Text>
              <TouchableOpacity onPress={() => setFloodHistoryVisible(false)} className="p-1">
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {floodHistory.length === 0 ? (
                <View className="items-center py-10">
                  <Ionicons name="time-outline" size={40} color="#94A3B8" />
                  <Text className="text-gray-400 font-semibold mt-3 text-center">
                    No active floods in the last 10 days
                  </Text>
                </View>
              ) : (
                floodHistory.map((item) => (
                  <View
                    key={item.id}
                    className="bg-gray-50 p-4 rounded-2xl mb-3 border border-gray-100 shadow-sm"
                  >
                    <View className="flex-row justify-between items-center">
                      <Text className="font-bold text-gray-900 text-base">
                        {item.details?.zone_name || `Zone ${item.zone_id}`}
                      </Text>
                      <View className="bg-green-50 border border-green-100 px-2.5 py-0.5 rounded-md">
                        <Text className="text-green-700 text-[9px] font-extrabold uppercase">
                          Resolved
                        </Text>
                      </View>
                    </View>

                    <View className="h-[1px] bg-gray-100 my-3.5" />

                    <View className="space-y-1.5">
                      <Text className="text-xs text-gray-500 font-semibold">
                        ⏱️ <Text className="font-bold text-gray-700">Duration:</Text> {formatDuration(item.created_at, item.completed_at)}
                      </Text>
                      <Text className="text-xs text-gray-500 font-semibold mt-1">
                        📅 <Text className="font-bold text-gray-700">Started:</Text> {formatTime(item.created_at)}
                      </Text>
                      <Text className="text-xs text-gray-500 font-semibold mt-1">
                        📅 <Text className="font-bold text-gray-700">Ended:</Text> {formatTime(item.completed_at)}
                      </Text>
                      <Text className="text-xs text-gray-500 font-semibold mt-1">
                        📡 <Text className="font-bold text-gray-700">Devices Reporting:</Text> {item.details?.reporting_devices_count ?? 0}
                      </Text>
                    </View>
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

const getStatusBg = (state: string) => {
  switch (state) {
    case "FLOOD":
    case "SOS":
      return "bg-red-50 border border-red-100";
    case "WARNING":
      return "bg-orange-50 border border-orange-100";
    case "LOST":
      return "bg-amber-50 border border-amber-100";
    case "WEAK_SIGNAL":
      return "bg-yellow-50 border border-yellow-100";
    case "SAFE":
      return "bg-green-50 border border-green-100";
    default:
      return "bg-gray-50 border border-gray-100";
  }
};

const getStatusText = (state: string) => {
  switch (state) {
    case "FLOOD":
    case "SOS":
      return "text-red-700";
    case "WARNING":
      return "text-orange-700";
    case "LOST":
      return "text-amber-700";
    case "WEAK_SIGNAL":
      return "text-yellow-700";
    case "SAFE":
      return "text-green-700";
    default:
      return "text-gray-700";
  }
};

const getStatusDot = (state: string) => {
  switch (state) {
    case "FLOOD":
    case "SOS":
      return "bg-red-500";
    case "WARNING":
      return "bg-orange-500";
    case "LOST":
      return "bg-amber-500";
    case "WEAK_SIGNAL":
      return "bg-yellow-500";
    case "SAFE":
      return "bg-green-500";
    default:
      return "bg-gray-400";
  }
};

const formatTime = (timestamp?: number | null) => {
  if (!timestamp) return "N/A";
  return new Date(timestamp * 1000).toLocaleString();
};

const normalizeLocation = (location: any) => {
  if (!location) return null;

  const latitude = location.latitude ?? location.lat;
  const longitude = location.longitude ?? location.lng;

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return null;
  }

  return {
    latitude,
    longitude,
  };
};

const buildRescuerList = (docs: any[], currentCoords: any) => {
  const currentUid = auth.currentUser?.uid;
  const list: any[] = [];

  docs.forEach((item) => {
    const data = item.data;

    if (data.role === "rescuer") {
      const location = normalizeLocation(data.location);
      const distanceKm =
        currentCoords && location
          ? getDistanceKm(
              currentCoords.latitude,
              currentCoords.longitude,
              location.latitude,
              location.longitude
            )
          : null;

      list.push({
        id: item.id,
        name: data.fullName || "Rescuer",
        status: data.status || "Offline",
        location,
        distanceKm,
        isMe: item.id === currentUid,
      });
    }
  });

  list.sort((a, b) => {
    if (a.isMe) return -1;
    if (b.isMe) return 1;
    if (a.distanceKm === null) return 1;
    if (b.distanceKm === null) return -1;
    return a.distanceKm - b.distanceKm;
  });

  return list;
};

const getDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

export default RescuerDashboard;
