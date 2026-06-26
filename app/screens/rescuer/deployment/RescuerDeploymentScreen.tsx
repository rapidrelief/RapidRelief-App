import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView
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
    
    // 1. Get orgId
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
    // 2. Get all zones
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

    // 3. Fetch global deployments concurrently
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

  const selectedOrgZoneName = orgZones.find(z => z.id === selectedOrgZoneId)?.name || "Unknown Zone";

  const renderDeviceCard = (device: any, isNode: boolean, zoneName: string) => {
    const id = isNode ? device.node_id : device.device_id;
    const title = isNode ? `Node ${id}` : `Gateway ${id}`;
    const icon = isNode ? "pulse" : "wifi";
    const color = device.status === "ONLINE" ? "#3B82F6" : device.status === "LOST" ? "#F59E0B" : "#EF4444";
    
    // Gateway-specific or Node-specific subtext
    const subtext = isNode ? `Via Gateway: ${device.gateway_id}` : `Location: Zone Center`;

    return (
      <View
        key={id}
        style={{
          backgroundColor: "white",
          padding: 16,
          borderRadius: 12,
          marginBottom: 8,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 5,
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name={icon} size={24} color={color} />
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: "#1F2937" }}>
                {title} <Text style={{ fontSize: 14, fontWeight: "normal", color: "#6B7280" }}>- {zoneName}</Text>
              </Text>
              <Text style={{ fontSize: 12, color: "#6B7280" }}>
                {subtext}
              </Text>
            </View>
          </View>
          <View style={{ backgroundColor: color, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>{device.status}</Text>
          </View>
        </View>

        {/* Alerts Row */}
        <View style={{ flexDirection: "row", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F3F4F6", alignItems: "center" }}>
          {device.sos && (
            <View style={{ flexDirection: "row", alignItems: "center", marginRight: 12, backgroundColor: "#FEE2E2", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
              <Ionicons name="warning" size={14} color="#EF4444" />
              <Text style={{ fontSize: 12, color: "#EF4444", fontWeight: "bold", marginLeft: 4 }}>SOS</Text>
            </View>
          )}
          {device.flood && (
            <View style={{ flexDirection: "row", alignItems: "center", marginRight: 12, backgroundColor: "#DBEAFE", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
              <Ionicons name="water" size={14} color="#3B82F6" />
              <Text style={{ fontSize: 12, color: "#3B82F6", fontWeight: "bold", marginLeft: 4 }}>FLOOD</Text>
            </View>
          )}
          {isNode && (
             <View style={{ flexDirection: "row", alignItems: "center", marginLeft: "auto" }}>
               <Ionicons name={device.encrypted ? "lock-closed" : "lock-open"} size={14} color={device.encrypted ? "#10B981" : "#F59E0B"} />
               <Text style={{ fontSize: 12, color: device.encrypted ? "#10B981" : "#F59E0B", fontWeight: "500", marginLeft: 4 }}>
                 {device.encrypted ? "Encrypted" : "Open"}
               </Text>
             </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F3F4F6", paddingTop: 100 }}>
      <Navbar title="Devices" />

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* =========================================================
              SECTION 1: ORGANISATION DEVICES STATUS
          ========================================================= */}
          <Text style={{ fontSize: 20, fontWeight: "900", color: "#111827", marginBottom: 16, marginTop: 8 }}>
            Organisation Devices Status
          </Text>

          {orgZones.length === 0 ? (
            <Text style={{ color: "#6B7280", fontStyle: "italic", marginBottom: 24 }}>No organization zones active.</Text>
          ) : (
            <>
              {/* Zone Slider */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20, maxHeight: 50 }}>
                {orgZones.map((z) => (
                  <TouchableOpacity
                    key={z.id}
                    onPress={() => setSelectedOrgZoneId(z.id)}
                    style={{
                      backgroundColor: selectedOrgZoneId === z.id ? "#2563EB" : "white",
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 20,
                      marginRight: 10,
                      borderWidth: 1,
                      borderColor: selectedOrgZoneId === z.id ? "#2563EB" : "#D1D5DB",
                      justifyContent: "center",
                      alignItems: "center",
                      height: 40
                    }}
                  >
                    <Text style={{ color: selectedOrgZoneId === z.id ? "white" : "#4B5563", fontWeight: "600" }}>
                      {z.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Org Gateways */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: "#374151", marginBottom: 8 }}>
                  Gateways
                </Text>
                {orgDeployment?.gateways?.length === 0 ? (
                  <Text style={{ color: "#6B7280", fontStyle: "italic", marginBottom: 8 }}>No gateways in this zone.</Text>
                ) : (
                  orgDeployment.gateways?.map((g: any) => renderDeviceCard(g, false, selectedOrgZoneName))
                )}
              </View>

              {/* Org Nodes */}
              <View style={{ marginBottom: 32 }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: "#374151", marginBottom: 8 }}>
                  Nodes
                </Text>
                {orgDeployment?.nodes?.length === 0 ? (
                  <Text style={{ color: "#6B7280", fontStyle: "italic", marginBottom: 8 }}>No nodes in this zone.</Text>
                ) : (
                  orgDeployment.nodes?.map((n: any) => renderDeviceCard(n, true, selectedOrgZoneName))
                )}
              </View>
            </>
          )}

          {/* =========================================================
              SECTION 2: GLOBAL DEVICES STATUS
          ========================================================= */}
          <Text style={{ fontSize: 20, fontWeight: "900", color: "#111827", marginBottom: 16, marginTop: 16 }}>
            Global Devices Status
          </Text>

          {globalDeployments.length === 0 ? (
            <Text style={{ color: "#6B7280", fontStyle: "italic" }}>No global zones active.</Text>
          ) : (
            globalDeployments.map((gDep) => (
              <View key={gDep.zone.id} style={{ backgroundColor: "#E5E7EB", borderRadius: 16, padding: 16, marginBottom: 24 }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1F2937", marginBottom: 12 }}>
                  {gDep.zone.name}
                </Text>

                {/* Gateways inside Global Card */}
                <Text style={{ fontSize: 14, fontWeight: "bold", color: "#4B5563", marginBottom: 8 }}>Gateways</Text>
                {gDep.gateways?.length === 0 ? (
                  <Text style={{ color: "#6B7280", fontStyle: "italic", marginBottom: 12, fontSize: 12 }}>No gateways.</Text>
                ) : (
                  gDep.gateways?.map((g: any) => renderDeviceCard(g, false, gDep.zone.name))
                )}

                {/* Nodes inside Global Card */}
                <Text style={{ fontSize: 14, fontWeight: "bold", color: "#4B5563", marginBottom: 8, marginTop: 8 }}>Nodes</Text>
                {gDep.nodes?.length === 0 ? (
                  <Text style={{ color: "#6B7280", fontStyle: "italic", marginBottom: 12, fontSize: 12 }}>No nodes.</Text>
                ) : (
                  gDep.nodes?.map((n: any) => renderDeviceCard(n, true, gDep.zone.name))
                )}
              </View>
            ))
          )}

        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default RescuerDeploymentScreen;
