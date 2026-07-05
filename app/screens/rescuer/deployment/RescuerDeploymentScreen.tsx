import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Navbar from "../components/RescuerNavbar";
import { getZoneDeployment, getZonesMap } from "@/app/services/api";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "@/app/config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const RescuerDeploymentScreen = () => {
  const [orgId, setOrgId] = useState<string | null>(null);

  const [orgZones, setOrgZones] = useState<any[]>([]);
  const [globalZones, setGlobalZones] = useState<any[]>([]);

  const [selectedOrgZoneId, setSelectedOrgZoneId] = useState<number | null>(null);
  const [orgDeployment, setOrgDeployment] = useState<any>({ gateways: [], nodes: [] });

  const [globalDeployments, setGlobalDeployments] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadInitialData(user.uid);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (selectedOrgZoneId) {
      loadOrgDeployment(selectedOrgZoneId);
    }
  }, [selectedOrgZoneId]);

  const loadInitialData = async (uid: string) => {
    setLoading(true);

    let currentOrgId = null;
    if (uid) {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists() && userDoc.data().organization_id) {
        currentOrgId = String(userDoc.data().organization_id);
        setOrgId(currentOrgId);
      }
    }

    await fetchZonesAndDeployments(currentOrgId);
  };

  const fetchZonesAndDeployments = async (currentOrgId: string | null) => {
    const data = await getZonesMap();
    const list = data?.zones || [];

    const orgZ = list.filter((z: any) => {
      if (!currentOrgId) return false;
      return String(z.organization_id) === currentOrgId;
    });
    const globZ = list.filter((z: any) => z.organization_id === null || z.organization_id === undefined);

    setOrgZones(orgZ);
    setGlobalZones(globZ);

    if (orgZ.length > 0 && !selectedOrgZoneId) {
      setSelectedOrgZoneId(orgZ[0].id);
    }

    const gDeps = await Promise.all(
      globZ.map(async (z: any) => {
        const dep = await getZoneDeployment(z.id);
        return { zone: z, ...dep };
      })
    );
    setGlobalDeployments(gDeps);

    setLoading(false);
  };

  const loadOrgDeployment = async (zoneId: number) => {
    const data = await getZoneDeployment(zoneId);
    setOrgDeployment(data || { gateways: [], nodes: [] });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchZonesAndDeployments(orgId);
    if (selectedOrgZoneId) {
      await loadOrgDeployment(selectedOrgZoneId);
    }
    setRefreshing(false);
  };

  const selectedOrgZoneName = orgZones.find((z) => z.id === selectedOrgZoneId)?.name || "Unknown Zone";

  const renderDeviceCard = (device: any, isNode: boolean, zoneName: string) => {
    const id = isNode ? device.node_id : device.device_id;
    const title = isNode ? `Node ${id}` : `Gateway ${id}`;
    const icon = isNode ? "pulse" : "wifi";
    
    let color = "#EF4444";
    let bgColor = "rgba(239, 68, 68, 0.15)";
    if (device.status === "ONLINE") {
      color = "#10B981";
      bgColor = "rgba(16, 185, 129, 0.15)";
    } else if (device.status === "LOST") {
      color = "#F59E0B";
      bgColor = "rgba(245, 158, 11, 0.15)";
    }

    const subtext = isNode ? `Via Gateway: ${device.gateway_id}` : `Location: Zone Center`;

    return (
      <View
        key={id}
        style={{
          backgroundColor: "#FFFFFF",
          padding: 18,
          borderRadius: 20,
          marginBottom: 12,
          shadowColor: "#94A3B8",
          shadowOpacity: 0.15,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
          borderWidth: 1,
          borderColor: "#F1F5F9",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: bgColor, justifyContent: "center", alignItems: "center", marginRight: 14 }}>
              <Ionicons name={icon} size={22} color={color} />
            </View>
            <View>
              <Text style={{ fontSize: 16, fontWeight: "900", color: "#1E293B", letterSpacing: 0.5 }}>
                {title} <Text style={{ fontSize: 13, fontWeight: "600", color: "#94A3B8" }}>- {zoneName}</Text>
              </Text>
              <Text style={{ fontSize: 12, fontWeight: "500", color: "#64748B", marginTop: 2 }}>
                {subtext}
              </Text>
            </View>
          </View>

          <View style={{ backgroundColor: bgColor, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
            <Text style={{ color: color, fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 }}>
              {device.status}
            </Text>
          </View>

        </View>

        {/* Alerts Row */}
        <View style={{ flexDirection: "row", marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#F1F5F9", alignItems: "center" }}>
          {device.sos && (
            <View style={{ flexDirection: "row", alignItems: "center", marginRight: 12, backgroundColor: "rgba(239, 68, 68, 0.1)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
              <Ionicons name="warning" size={14} color="#EF4444" />
              <Text style={{ fontSize: 11, color: "#EF4444", fontWeight: "900", marginLeft: 6, letterSpacing: 0.5 }}>SOS ALERT</Text>
            </View>
          )}
          {device.flood && (
            <View style={{ flexDirection: "row", alignItems: "center", marginRight: 12, backgroundColor: "rgba(59, 130, 246, 0.1)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
              <Ionicons name="water" size={14} color="#3B82F6" />
              <Text style={{ fontSize: 11, color: "#3B82F6", fontWeight: "900", marginLeft: 6, letterSpacing: 0.5 }}>FLOOD ALERT</Text>
            </View>
          )}
          {isNode && (
             <View style={{ flexDirection: "row", alignItems: "center", marginLeft: "auto", backgroundColor: device.encrypted ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
               <Ionicons name={device.encrypted ? "lock-closed" : "lock-open"} size={14} color={device.encrypted ? "#10B981" : "#F59E0B"} />
               <Text style={{ fontSize: 11, color: device.encrypted ? "#10B981" : "#F59E0B", fontWeight: "800", marginLeft: 6, letterSpacing: 0.5 }}>
                 {device.encrypted ? "ENCRYPTED" : "OPEN"}
               </Text>
             </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <Navbar />

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: 130, paddingHorizontal: 20, paddingBottom: 60 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4F46E5"]} />}
        >
          {/* =========================================================
              SECTION 1: ORGANISATION DEVICES STATUS
          ========================================================= */}
          <Text style={{ fontSize: 14, fontWeight: "900", color: "#94A3B8", marginBottom: 16, marginTop: 8, textTransform: "uppercase", letterSpacing: 1 }}>
            Organisation Devices
          </Text>

          {orgZones.length === 0 ? (
            <Text style={{ color: "#94A3B8", fontStyle: "italic", marginBottom: 24 }}>No organization zones active.</Text>
          ) : (
            <>
              {/* Zone Slider */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24, maxHeight: 50 }}>
                {orgZones.map((z) => (
                  <TouchableOpacity
                    key={z.id}
                    onPress={() => setSelectedOrgZoneId(z.id)}
                    style={{
                      backgroundColor: selectedOrgZoneId === z.id ? "#4F46E5" : "#FFFFFF",
                      paddingHorizontal: 20,
                      paddingVertical: 12,
                      borderRadius: 999,
                      marginRight: 12,
                      shadowColor: selectedOrgZoneId === z.id ? "#4F46E5" : "#64748B",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: selectedOrgZoneId === z.id ? 0.3 : 0.1,
                      shadowRadius: 8,
                      elevation: 4,
                      justifyContent: "center",
                      alignItems: "center",
                      height: 44,
                      borderWidth: selectedOrgZoneId === z.id ? 0 : 1,
                      borderColor: "#E2E8F0"
                    }}
                  >
                    <Text style={{ color: selectedOrgZoneId === z.id ? "white" : "#475569", fontWeight: "800", letterSpacing: 0.5 }}>
                      {z.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Org Gateways */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: "800", color: "#64748B", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  <Ionicons name="wifi" size={14} /> Gateways
                </Text>
                {orgDeployment?.gateways?.length === 0 ? (
                  <View style={{ backgroundColor: "#FFFFFF", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#F1F5F9", borderStyle: "dashed" }}>
                     <Text style={{ color: "#94A3B8", fontStyle: "italic", textAlign: "center" }}>No gateways online.</Text>
                  </View>
                ) : (
                  orgDeployment.gateways?.map((g: any) => renderDeviceCard(g, false, selectedOrgZoneName))
                )}
              </View>

              {/* Org Nodes */}
              <View style={{ marginBottom: 40 }}>
                <Text style={{ fontSize: 13, fontWeight: "800", color: "#64748B", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  <Ionicons name="pulse" size={14} /> Sensor Nodes
                </Text>
                {orgDeployment?.nodes?.length === 0 ? (
                   <View style={{ backgroundColor: "#FFFFFF", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#F1F5F9", borderStyle: "dashed" }}>
                     <Text style={{ color: "#94A3B8", fontStyle: "italic", textAlign: "center" }}>No nodes online.</Text>
                   </View>
                ) : (
                  orgDeployment.nodes?.map((n: any) => renderDeviceCard(n, true, selectedOrgZoneName))
                )}
              </View>
            </>
          )}

          {/* =========================================================
              SECTION 2: GLOBAL DEVICES STATUS
          ========================================================= */}
          <Text style={{ fontSize: 14, fontWeight: "900", color: "#94A3B8", marginBottom: 16, marginTop: 16, textTransform: "uppercase", letterSpacing: 1 }}>
            Global Operations
          </Text>

          {globalDeployments.length === 0 ? (
            <Text style={{ color: "#94A3B8", fontStyle: "italic" }}>No global zones active.</Text>
          ) : (
            globalDeployments.map((gDep) => (
              <View key={gDep.zone.id} style={{ backgroundColor: "#FFFFFF", borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: "#E2E8F0", shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#10B981", marginRight: 8, shadowColor: "#10B981", shadowOpacity: 0.8, shadowRadius: 6, shadowOffset: {width: 0, height:0} }} />
                  <Text style={{ fontSize: 18, fontWeight: "900", color: "#1E293B", letterSpacing: 0.5 }}>
                    {gDep.zone.name}
                  </Text>
                </View>

                {/* Gateways inside Global Card */}
                <Text style={{ fontSize: 12, fontWeight: "800", color: "#64748B", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Gateways</Text>
                {gDep.gateways?.length === 0 ? (
                  <Text style={{ color: "#94A3B8", fontStyle: "italic", marginBottom: 16, fontSize: 12 }}>None reporting.</Text>
                ) : (
                  gDep.gateways?.map((g: any) => renderDeviceCard(g, false, gDep.zone.name))
                )}

                {/* Nodes inside Global Card */}
                <Text style={{ fontSize: 12, fontWeight: "800", color: "#64748B", marginBottom: 10, marginTop: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>Nodes</Text>
                {gDep.nodes?.length === 0 ? (
                  <Text style={{ color: "#94A3B8", fontStyle: "italic", marginBottom: 8, fontSize: 12 }}>None reporting.</Text>
                ) : (
                  gDep.nodes?.map((n: any) => renderDeviceCard(n, true, gDep.zone.name))
                )}
              </View>
            ))
          )}

        </ScrollView>
      )}
    </View>
  );
};

export default RescuerDeploymentScreen;
