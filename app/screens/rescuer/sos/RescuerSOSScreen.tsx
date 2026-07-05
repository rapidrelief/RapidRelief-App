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
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <Navbar />

      <ScrollView
        contentContainerStyle={{ paddingTop: 130, paddingBottom: 60, paddingHorizontal: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshSOS} colors={["#EF4444"]} />
        }
      >
        <View style={{ marginBottom: 24, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
          <View>
            <Text style={{ fontSize: 26, fontWeight: "900", color: "#1E293B", letterSpacing: 0.5 }}>
              Emergency SOS
            </Text>
            <Text style={{ fontSize: 13, color: "#EF4444", marginTop: 4, fontWeight: "800", letterSpacing: 0.5, textTransform: "uppercase" }}>
              Active Incidents
            </Text>
          </View>

          <TouchableOpacity
            onPress={loadHistory}
            style={{ backgroundColor: "rgba(79, 70, 229, 0.1)", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 }}
          >
            <Text style={{ color: "#4F46E5", fontWeight: "800", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
              History
            </Text>
          </TouchableOpacity>
        </View>

        {refreshing && (
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#EFF6FF", padding: 12, borderRadius: 16, marginBottom: 20 }}>
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text style={{ marginLeft: 8, color: "#2563EB", fontWeight: "700" }}>Refreshing incidents...</Text>
          </View>
        )}

        {sosItems.length === 0 && floodAlerts.length === 0 && !refreshing && (
          <View style={{ backgroundColor: "#FFFFFF", padding: 32, borderRadius: 20, borderWidth: 1, borderColor: "#F1F5F9", alignItems: "center", borderStyle: "dashed", marginTop: 20 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(34, 197, 94, 0.1)", justifyContent: "center", alignItems: "center", marginBottom: 16 }}>
              <Ionicons name="shield-checkmark" size={32} color="#10B981" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#1E293B" }}>All Clear</Text>
            <Text style={{ color: "#94A3B8", fontWeight: "500", textAlign: "center", marginTop: 8 }}>
              There are no active emergencies or SOS requests right now.
            </Text>
          </View>
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
              style={{
                backgroundColor: "#FFFFFF",
                padding: 20,
                borderRadius: 24,
                marginBottom: 20,
                shadowColor: "#EF4444",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
                elevation: 6,
                borderWidth: 1,
                borderColor: "rgba(239, 68, 68, 0.2)",
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={{ fontSize: 20, fontWeight: "900", color: "#1E293B" }}>
                    {sos.user_name || sos.rescuer_name || "Unknown Individual"}
                  </Text>
                  
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6, backgroundColor: "rgba(239, 68, 68, 0.1)", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                    <Ionicons name="warning" size={14} color="#EF4444" />
                    <Text style={{ fontSize: 11, color: "#EF4444", fontWeight: "900", marginLeft: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {sos.source === "AUTO" ? "Automated SOS" : "Manual SOS"}
                    </Text>
                  </View>

                  <View style={{ marginTop: 16 }}>
                     <Text style={{ fontSize: 13, color: "#64748B", fontWeight: "600", marginBottom: 4 }}>
                       <Ionicons name="location" size={12} /> Zone ID: <Text style={{ color: "#1E293B", fontWeight: "800" }}>{sos.zone_id || "Global"}</Text>
                     </Text>
                     <Text style={{ fontSize: 13, color: "#64748B", fontWeight: "600" }}>
                       <Ionicons name="time" size={12} /> Time: <Text style={{ color: "#1E293B", fontWeight: "800" }}>{formatTime(sos.created_at)}</Text>
                     </Text>
                  </View>
                </View>

                <View style={{ backgroundColor: "#EF4444", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, shadowColor: "#EF4444", shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: {width: 0, height: 4} }}>
                  <Text style={{ color: "white", fontSize: 10, fontWeight: "900", tracking: 1, textTransform: "uppercase", letterSpacing: 1 }}>
                    ACTIVE
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", marginTop: 24, gap: 12 }}>
                <TouchableOpacity
                  onPress={() => {
                    router.push({
                      pathname: "/rescuer/map",
                      params: { sos: JSON.stringify(sos) },
                    });
                  }}
                  style={{ flex: 1, backgroundColor: "#4F46E5", paddingVertical: 14, borderRadius: 16, flexDirection: "row", justifyContent: "center", alignItems: "center", shadowColor: "#4F46E5", shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: {width:0, height:4} }}
                >
                  <Ionicons name="map" size={16} color="white" />
                  <Text style={{ color: "white", fontWeight: "900", fontSize: 13, marginLeft: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Locate
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={async () => {
                    await completeSOS(sos.id);
                    await loadActiveSOS();
                  }}
                  style={{ flex: 1, backgroundColor: "#10B981", paddingVertical: 14, borderRadius: 16, flexDirection: "row", justifyContent: "center", alignItems: "center", shadowColor: "#10B981", shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: {width:0, height:4} }}
                >
                  <Ionicons name="shield-checkmark" size={16} color="white" />
                  <Text style={{ color: "white", fontWeight: "900", fontSize: 13, marginLeft: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Mark Safe
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        )}

        {floodAlerts.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: "900", color: "#1E293B", marginBottom: 16 }}>
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

      </ScrollView>

      {/* SOS HISTORY MODAL */}
      <Modal visible={historyVisible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(15, 23, 42, 0.6)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#F8FAFC", borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: "85%", shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 20 }}>
            
            <View style={{ width: 40, height: 5, backgroundColor: "#CBD5E1", borderRadius: 3, alignSelf: "center", marginBottom: 20 }} />

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ fontSize: 22, fontWeight: "900", color: "#1E293B" }}>
                SOS History
              </Text>
              <TouchableOpacity onPress={() => setHistoryVisible(false)} style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 }}>
                <Text style={{ color: "#EF4444", fontWeight: "900", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {history.length === 0 ? (
                <View style={{ paddingVertical: 40, alignItems: "center" }}>
                  <Ionicons name="time-outline" size={40} color="#CBD5E1" style={{ marginBottom: 12 }} />
                  <Text style={{ color: "#94A3B8", fontWeight: "600" }}>No SOS history available.</Text>
                </View>
              ) : (
                history.map((sos) => (
                  <View
                    key={sos.id}
                    style={{ backgroundColor: "#FFFFFF", padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E2E8F0" }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                      <Text style={{ fontSize: 16, fontWeight: "800", color: "#1E293B" }}>
                        {sos.user_name || sos.rescuer_name || sos.details?.zone_name || "SOS Request"}
                      </Text>
                      <Text style={{ fontSize: 11, fontWeight: "800", color: "#10B981", textTransform: "uppercase" }}>RESOLVED</Text>
                    </View>
                    
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
                      <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "600" }}>Zone: {sos.zone_id || "N/A"}</Text>
                      <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "600" }}>Source: {sos.source || "RESCUER"}</Text>
                    </View>
                    
                    <Text style={{ fontSize: 12, color: "#94A3B8", fontWeight: "600", marginTop: 8 }}>
                      Completed: {formatTime(sos.completed_at)}
                    </Text>
                  </View>
                ))
              )}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const ZoneAlertCard = ({ alert, onClear, clearing }: any) => {
  const isSos = alert.source === "ZONE_SOS";
  const label = isSos ? "ZONE SOS" : "FLOOD DETECTED";
  
  const bgColor = isSos ? "#FFFFFF" : "#FFFFFF";
  const borderColor = isSos ? "rgba(239, 68, 68, 0.3)" : "rgba(59, 130, 246, 0.3)";
  const shadowColor = isSos ? "#EF4444" : "#3B82F6";
  const iconColor = isSos ? "#EF4444" : "#3B82F6";
  const iconBg = isSos ? "rgba(239, 68, 68, 0.1)" : "rgba(59, 130, 246, 0.1)";
  const iconName = isSos ? "warning" : "water";

  const reportingNodes = alert.reporting_nodes || alert.details?.reporting_nodes || [];
  const reportingGateways = alert.reporting_gateways || alert.details?.reporting_gateways || [];

  return (
    <View
      style={{
        backgroundColor: bgColor,
        padding: 20,
        borderRadius: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: borderColor,
        shadowColor: shadowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 5,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: iconBg, justifyContent: "center", alignItems: "center", marginRight: 16 }}>
          <Ionicons name={iconName as any} size={24} color={iconColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: "900", color: "#1E293B", letterSpacing: 0.5 }}>
             {label}
          </Text>
          <Text style={{ fontSize: 13, fontWeight: "600", color: iconColor, marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
             Zone Critical Alert
          </Text>
        </View>
      </View>

      <View style={{ backgroundColor: "#F8FAFC", padding: 16, borderRadius: 16, marginBottom: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
          <Text style={{ fontSize: 13, color: "#64748B", fontWeight: "600" }}>Zone Name / ID</Text>
          <Text style={{ fontSize: 13, color: "#1E293B", fontWeight: "800" }}>{alert.zone_name || alert.details?.zone_name || alert.zone_id}</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
          <Text style={{ fontSize: 13, color: "#64748B", fontWeight: "600" }}>Reported Time</Text>
          <Text style={{ fontSize: 13, color: "#1E293B", fontWeight: "800" }}>{formatTime(alert.created_at)}</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
          <Text style={{ fontSize: 13, color: "#64748B", fontWeight: "600" }}>Affected Nodes</Text>
          <Text style={{ fontSize: 13, color: "#1E293B", fontWeight: "800" }}>[{reportingNodes.join(", ")}]</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 13, color: "#64748B", fontWeight: "600" }}>Affected Gateways</Text>
          <Text style={{ fontSize: 13, color: "#1E293B", fontWeight: "800" }}>[{reportingGateways.join(", ")}]</Text>
        </View>
      </View>

      {isSos && (
        <TouchableOpacity
          onPress={onClear}
          disabled={clearing}
          style={{
            backgroundColor: "#10B981",
            paddingVertical: 14,
            borderRadius: 16,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#10B981",
            shadowOpacity: 0.3,
            shadowRadius: 8,
            shadowOffset: {width: 0, height: 4}
          }}
        >
          {clearing ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={18} color="white" style={{ marginRight: 8 }} />
              <Text style={{ color: "white", fontSize: 14, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Clear Emergency State
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const formatTime = (timestamp?: number | null) => {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

export default RescuerSOSScreen;
