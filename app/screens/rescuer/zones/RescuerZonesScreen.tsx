import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import Navbar from "../components/RescuerNavbar";
import { getZonesMap } from "@/app/services/api";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "@/app/config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { LinearGradient } from "expo-linear-gradient";

const RescuerZonesScreen = () => {
  const [zones, setZones] = useState<any[]>([]);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"org" | "global">("org");
  const [expandedZoneId, setExpandedZoneId] = useState<number | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadUserOrgAndZones(user.uid);
      }
    });
    return () => unsub();
  }, []);

  const loadUserOrgAndZones = async (uid: string) => {
    setLoading(true);

    if (uid) {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists() && userDoc.data().organization_id) {
        setOrgId(String(userDoc.data().organization_id));
      }
    }

    await loadZones();
  };

  const loadZones = async () => {
    const data = await getZonesMap();
    setZones(data?.zones || []);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const user = auth.currentUser;
    if (user) {
      await loadUserOrgAndZones(user.uid);
    } else {
      await loadZones();
    }
    setRefreshing(false);
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return { bg: "rgba(239, 68, 68, 0.15)", text: "#DC2626" };
      case "medium":
        return { bg: "rgba(234, 179, 8, 0.15)", text: "#CA8A04" };
      case "low":
        return { bg: "rgba(34, 197, 94, 0.15)", text: "#16A34A" };
      default:
        return { bg: "rgba(156, 163, 175, 0.15)", text: "#6B7280" };
    }
  };

  const getStatusStyle = (status: string) => {
    if (!status) return { bg: "#9CA3AF", icon: "help-circle" };
    switch (status.toLowerCase()) {
      case "online":
        return { bg: "#22C55E", icon: "checkmark-circle" };
      case "sos":
        return { bg: "#EF4444", icon: "warning" };
      case "flood":
        return { bg: "#3B82F6", icon: "water" };
      case "lost":
        return { bg: "#F59E0B", icon: "radio" };
      default:
        return { bg: "#9CA3AF", icon: "help-circle" };
    }
  };

  const filteredZones = zones.filter((z) => {
    if (activeTab === "org") {
      if (!orgId) return false;
      return String(z.organization_id) === String(orgId);
    } else {
      return z.organization_id === null || z.organization_id === undefined;
    }
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <Navbar />

      {/* TABS CONTAINER */}
      <View
        style={{
          marginTop: 130, // Push below floating navbar
          paddingHorizontal: 20,
          marginBottom: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#E2E8F0",
            padding: 4,
            borderRadius: 999,
          }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 999,
              backgroundColor: activeTab === "org" ? "#FFFFFF" : "transparent",
              alignItems: "center",
              shadowColor: activeTab === "org" ? "#64748B" : "transparent",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: activeTab === "org" ? 0.2 : 0,
              shadowRadius: 4,
              elevation: activeTab === "org" ? 3 : 0,
            }}
            onPress={() => {
              setActiveTab("org");
              setExpandedZoneId(null);
            }}
          >
            <Text
              style={{
                fontWeight: "800",
                fontSize: 14,
                letterSpacing: 0.5,
                color: activeTab === "org" ? "#334155" : "#64748B",
              }}
            >
              Organization
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 999,
              backgroundColor: activeTab === "global" ? "#FFFFFF" : "transparent",
              alignItems: "center",
              shadowColor: activeTab === "global" ? "#64748B" : "transparent",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: activeTab === "global" ? 0.2 : 0,
              shadowRadius: 4,
              elevation: activeTab === "global" ? 3 : 0,
            }}
            onPress={() => {
              setActiveTab("global");
              setExpandedZoneId(null);
            }}
          >
            <Text
              style={{
                fontWeight: "800",
                fontSize: 14,
                letterSpacing: 0.5,
                color: activeTab === "global" ? "#334155" : "#64748B",
              }}
            >
              Global
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4F46E5"]} />
          }
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: "bold",
              color: "#94A3B8",
              marginBottom: 16,
              marginLeft: 4,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {filteredZones.length} {activeTab === "org" ? "Organization" : "Global"} Zones
          </Text>

          {filteredZones.map((zone) => {
            const isExpanded = expandedZoneId === zone.id;
            const priorityStyle = getPriorityStyle(zone.priority);
            const statusStyle = getStatusStyle(zone.state);

            return (
              <TouchableOpacity
                key={zone.id}
                onPress={() => setExpandedZoneId(isExpanded ? null : zone.id)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  marginBottom: 16,
                  shadowColor: "#94A3B8",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.15,
                  shadowRadius: 12,
                  elevation: 5,
                  borderWidth: 1,
                  borderColor: "#F1F5F9",
                  overflow: "hidden",
                }}
              >
                <View style={{ padding: 20 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(79, 70, 229, 0.1)", justifyContent: "center", alignItems: "center", marginRight: 12 }}>
                        <Ionicons name="location" size={20} color="#4F46E5" />
                      </View>
                      <View>
                        <Text style={{ fontSize: 17, fontWeight: "900", color: "#1E293B", letterSpacing: 0.5 }}>
                          {zone.name}
                        </Text>
                        <Text style={{ fontSize: 12, fontWeight: "600", color: "#94A3B8", marginTop: 2, textTransform: "uppercase" }}>
                          Zone ID: {zone.id}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={{
                        backgroundColor: priorityStyle.bg,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ color: priorityStyle.text, fontSize: 11, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 }}>
                        {zone.priority || "N/A"}
                      </Text>
                    </View>
                  </View>

                  {isExpanded && (
                    <View style={{ marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: "#F1F5F9" }}>
                      
                      {/* STATUS ROW */}
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <Text style={{ fontSize: 14, fontWeight: "bold", color: "#64748B" }}>Network Status</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: statusStyle.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, shadowColor: statusStyle.bg, shadowOpacity: 0.4, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }}>
                          <Ionicons name={statusStyle.icon as any} size={14} color="white" />
                          <Text style={{ marginLeft: 6, fontSize: 11, fontWeight: "800", color: "white", textTransform: "uppercase", letterSpacing: 1 }}>
                            {zone.state || "UNKNOWN"}
                          </Text>
                        </View>
                      </View>

                      {/* STATS GRID */}
                      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
                        
                        <View style={{ width: "48%", backgroundColor: "#F8FAFC", padding: 12, borderRadius: 12, marginBottom: 12 }}>
                          <Text style={{ fontSize: 12, fontWeight: "600", color: "#94A3B8", marginBottom: 4 }}>Coordinates</Text>
                          <Text style={{ fontSize: 13, fontWeight: "800", color: "#334155" }}>
                            {zone.lat.toFixed(3)}, {zone.lng.toFixed(3)}
                          </Text>
                        </View>

                        <View style={{ width: "48%", backgroundColor: "#F8FAFC", padding: 12, borderRadius: 12, marginBottom: 12 }}>
                          <Text style={{ fontSize: 12, fontWeight: "600", color: "#94A3B8", marginBottom: 4 }}>Zone Radius</Text>
                          <Text style={{ fontSize: 13, fontWeight: "800", color: "#334155" }}>
                            {zone.radius_m}m
                          </Text>
                        </View>

                        <View style={{ width: "48%", backgroundColor: "#F8FAFC", padding: 12, borderRadius: 12 }}>
                          <Text style={{ fontSize: 12, fontWeight: "600", color: "#94A3B8", marginBottom: 4 }}>Total Devices</Text>
                          <Text style={{ fontSize: 15, fontWeight: "900", color: "#4F46E5" }}>
                            {zone.total_devices || 0}
                          </Text>
                        </View>

                        <View style={{ width: "48%", backgroundColor: (zone.lost_devices > 0) ? "rgba(239, 68, 68, 0.05)" : "#F8FAFC", padding: 12, borderRadius: 12 }}>
                          <Text style={{ fontSize: 12, fontWeight: "600", color: (zone.lost_devices > 0) ? "#EF4444" : "#94A3B8", marginBottom: 4 }}>Lost Devices</Text>
                          <Text style={{ fontSize: 15, fontWeight: "900", color: (zone.lost_devices > 0) ? "#EF4444" : "#334155" }}>
                            {zone.lost_devices || 0}
                          </Text>
                        </View>

                      </View>

                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

export default RescuerZonesScreen;
