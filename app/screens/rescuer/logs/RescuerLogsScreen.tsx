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
import { Ionicons } from "@expo/vector-icons";

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
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <Navbar />

      <ScrollView contentContainerStyle={{ paddingTop: 130, paddingBottom: 60, paddingHorizontal: 20 }}>
        
        {/* HEADER SECTION */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 26, fontWeight: "900", color: "#1E293B", letterSpacing: 0.5 }}>
            Activity Logs
          </Text>
          <Text style={{ fontSize: 13, color: "#64748B", marginTop: 4, fontWeight: "500", lineHeight: 20 }}>
            Real-time event history, system diagnostics, and emergency SOS dispatches.
          </Text>
        </View>

        {/* ZONE SELECTOR SLIDER */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24, maxHeight: 50 }}>
          {zones.map((zone) => {
            const active = selectedZoneId === zone.id;
            return (
              <TouchableOpacity
                key={zone.id}
                onPress={() => setSelectedZoneId(zone.id)}
                style={{
                  backgroundColor: active ? "#4F46E5" : "#FFFFFF",
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 999,
                  marginRight: 12,
                  shadowColor: active ? "#4F46E5" : "#94A3B8",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: active ? 0.3 : 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                  justifyContent: "center",
                  alignItems: "center",
                  height: 44,
                  borderWidth: active ? 0 : 1,
                  borderColor: "#E2E8F0"
                }}
              >
                <Text style={{ color: active ? "white" : "#475569", fontWeight: "800", letterSpacing: 0.5 }}>
                  {zone.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "900", color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1 }}>
            History Timeline
          </Text>
          <Text style={{ color: "#4F46E5", fontSize: 12, fontWeight: "800", textTransform: "uppercase" }}>
            {loading ? "Refreshing..." : "Live updates"}
          </Text>
        </View>

        {/* LOGS LIST */}
        {combinedLogs.length === 0 ? (
          <View style={{ backgroundColor: "#FFFFFF", padding: 24, borderRadius: 16, borderWidth: 1, borderColor: "#F1F5F9", borderStyle: "dashed", alignItems: "center" }}>
            <Ionicons name="document-text-outline" size={32} color="#CBD5E1" style={{ marginBottom: 8 }} />
            <Text style={{ color: "#94A3B8", fontStyle: "italic", textAlign: "center" }}>
              No recorded activity for this zone.
            </Text>
          </View>
        ) : (
          combinedLogs.map((item, index) => (
            <LogCard key={`${item.source}-${item.id || index}`} item={item} />
          ))
        )}

      </ScrollView>
    </View>
  );
};

const LogCard = ({ item }: any) => {
  const isSos = item.source === "SOS";
  
  const iconName = isSos ? "warning" : "terminal";
  const iconColor = isSos ? "#EF4444" : "#3B82F6";
  const iconBg = isSos ? "rgba(239, 68, 68, 0.15)" : "rgba(59, 130, 246, 0.15)";
  
  const title = isSos ? "SOS Emergency Request" : item.type;

  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        padding: 18,
        borderRadius: 20,
        marginBottom: 16,
        shadowColor: "#94A3B8",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
        borderWidth: 1,
        borderColor: "#F1F5F9",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
        
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: iconBg, justifyContent: "center", alignItems: "center", marginRight: 14 }}>
            <Ionicons name={iconName as any} size={20} color={iconColor} />
          </View>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: "900", color: "#1E293B", letterSpacing: 0.5 }}>
              {title}
            </Text>
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#94A3B8", marginTop: 4 }}>
              {formatTime(item.timestamp)}
            </Text>
          </View>
        </View>

        <View style={{ backgroundColor: iconBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
          <Text style={{ color: iconColor, fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 }}>
            {item.source}
          </Text>
        </View>

      </View>

      <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#F1F5F9" }}>
        {isSos ? (
          <View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ fontSize: 13, color: "#64748B", fontWeight: "600" }}>Dispatch Status</Text>
              <Text style={{ fontSize: 13, color: "#1E293B", fontWeight: "800" }}>{item.status}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ fontSize: 13, color: "#64748B", fontWeight: "600" }}>Assigned Rescuer</Text>
              <Text style={{ fontSize: 13, color: "#1E293B", fontWeight: "800" }}>{item.rescuer_name || "Unassigned"}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: "#64748B", fontWeight: "600" }}>Rescuer ID</Text>
              <Text style={{ fontSize: 13, color: "#1E293B", fontWeight: "800" }}>{item.rescuer_id || "N/A"}</Text>
            </View>
          </View>
        ) : (
          <View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ fontSize: 13, color: "#64748B", fontWeight: "600" }}>Device Link</Text>
              <Text style={{ fontSize: 13, color: "#1E293B", fontWeight: "800" }}>{item.device_id || "System Core"}</Text>
            </View>
            <View>
              <Text style={{ fontSize: 13, color: "#64748B", fontWeight: "600", marginBottom: 4 }}>Log Payload</Text>
              <View style={{ backgroundColor: "#F8FAFC", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0" }}>
                <Text style={{ fontSize: 12, color: "#475569", fontFamily: "monospace" }}>
                  {formatDetails(item.details)}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const formatDetails = (details: any) => {
  if (!details) return "No payload data attached.";
  return Object.entries(details)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
};

const formatTime = (timestamp?: number | null) => {
  if (!timestamp) return "Unknown timestamp";
  
  const date = new Date(timestamp * 1000);
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  };
  return date.toLocaleString('en-US', options);
};

export default RescuerLogsScreen;
