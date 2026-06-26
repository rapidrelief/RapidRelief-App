import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView
} from "react-native";
import Navbar from "../components/RescuerNavbar";
import { getZonesMap } from "@/app/services/api";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "@/app/config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

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
    
    // Get rescuer's org ID
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

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "#EF4444";
      case "medium":
        return "#EAB308";
      case "low":
        return "#22C55E";
      default:
        return "#9CA3AF";
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return "#9CA3AF";
    switch (status.toLowerCase()) {
      case "online": return "#22C55E";
      case "sos": return "#EF4444";
      case "flood": return "#3B82F6";
      case "lost": return "#F59E0B";
      default: return "#9CA3AF";
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F3F4F6", paddingTop: 100 }}>
      <Navbar title="Active Zones" />

      {/* TABS */}
      <View style={{ flexDirection: "row", padding: 16, backgroundColor: "white", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 }}>
        <TouchableOpacity 
          style={{ flex: 1, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: activeTab === "org" ? "#2563EB" : "transparent", alignItems: "center" }}
          onPress={() => { setActiveTab("org"); setExpandedZoneId(null); }}
        >
          <Text style={{ fontWeight: "bold", color: activeTab === "org" ? "#2563EB" : "#6B7280" }}>Organization</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={{ flex: 1, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: activeTab === "global" ? "#2563EB" : "transparent", alignItems: "center" }}
          onPress={() => { setActiveTab("global"); setExpandedZoneId(null); }}
        >
          <Text style={{ fontWeight: "bold", color: activeTab === "global" ? "#2563EB" : "#6B7280" }}>Global</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Text style={{ fontSize: 14, color: "#6B7280", marginBottom: 12, marginLeft: 4 }}>
            {filteredZones.length} {activeTab === "org" ? "Organization" : "Global"} Zones Active
          </Text>

          {filteredZones.map((zone) => {
            const isExpanded = expandedZoneId === zone.id;

            return (
              <TouchableOpacity
                key={zone.id}
                onPress={() => setExpandedZoneId(isExpanded ? null : zone.id)}
                style={{
                  backgroundColor: "white",
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 12,
                  shadowColor: "#000",
                  shadowOpacity: 0.05,
                  shadowRadius: 5,
                  elevation: 2,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: "bold", color: "#1F2937" }}>
                      {zone.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                      ID: {zone.id}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: getPriorityColor(zone.priority),
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 10, fontWeight: "bold", textTransform: "uppercase" }}>
                      {zone.priority}
                    </Text>
                  </View>
                </View>

                {isExpanded && (
                  <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#E5E7EB" }}>
                    
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                      <Text style={{ fontSize: 14, color: "#6B7280" }}>Status</Text>
                      <View style={{ backgroundColor: getStatusColor(zone.state), paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
                        <Text style={{ fontSize: 12, fontWeight: "bold", color: "white", textTransform: "uppercase" }}>
                           {zone.state || "UNKNOWN"}
                        </Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                      <Text style={{ fontSize: 14, color: "#6B7280" }}>Coordinates</Text>
                      <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151" }}>{zone.lat.toFixed(4)}, {zone.lng.toFixed(4)}</Text>
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                      <Text style={{ fontSize: 14, color: "#6B7280" }}>Radius</Text>
                      <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151" }}>{zone.radius_m} meters</Text>
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                      <Text style={{ fontSize: 14, color: "#6B7280" }}>Total Devices</Text>
                      <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151" }}>{zone.total_devices || 0}</Text>
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ fontSize: 14, color: "#6B7280" }}>Lost Devices</Text>
                      <Text style={{ fontSize: 14, fontWeight: "500", color: (zone.lost_devices > 0) ? "#EF4444" : "#374151" }}>
                        {zone.lost_devices || 0}
                      </Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default RescuerZonesScreen;
