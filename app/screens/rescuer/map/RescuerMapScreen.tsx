import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Modal } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import { useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { getZonesMap, getZoneDeployment, API_BASE_URL, getActiveSOS } from "@/app/services/api";
import { subscribeToZones, subscribeToActiveSOS } from "@/app/services/realtimeService";
import { generateZoneAnalysis } from "@/app/services/aiService";
import Navbar from "../components/RescuerNavbar";

const RescuerMapScreen = () => {
  const { zone, sos, rescuer } = useLocalSearchParams();
  const mapRef = useRef<MapView>(null);

  const parsedZone = zone ? JSON.parse(zone as string) : null;
  const parsedSOS = sos ? JSON.parse(sos as string) : null;
  const parsedRescuer = rescuer ? JSON.parse(rescuer as string) : null;

  const [zones, setZones] = useState<any[]>([]);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [selectedSOS, setSelectedSOS] = useState<any>(null);
  const [selectedRescuer, setSelectedRescuer] = useState<any>(null);
  const [rescuerAddress, setRescuerAddress] = useState("Fetching address...");
  const [collapsed, setCollapsed] = useState(false);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [aiPrediction, setAiPrediction] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // SOS List State
  const [sosList, setSosList] = useState<any[]>([]);
  const [showSosList, setShowSosList] = useState(false);

  // ================= LOCATION =================
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation(loc.coords);
    })();

    const interval = setInterval(async () => {
      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation(loc.coords);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // ================= ZONES & SOS =================
  useEffect(() => {
    loadZones();
    loadActiveSOS();

    const unsubZones = subscribeToZones((data) => {
      setZones(data?.zones || []);
    });

    const unsubSOS = subscribeToActiveSOS((data) => {
      setSosList(data?.sos || []);
    });

    return () => {
      unsubZones();
      unsubSOS();
    };
  }, []);

  const loadZones = async () => {
    try {
      const data = await getZonesMap();
      setZones(data?.zones || []);
    } catch (err) {
      console.log(err);
    }
  };

  const loadActiveSOS = async () => {
    try {
      const data = await getActiveSOS();
      setSosList(data?.sos || []);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= SYNC PARAMS =================
  useEffect(() => {
    if (parsedZone) {
      setSelectedZone(parsedZone);
      setSelectedSOS(null);
      setSelectedRescuer(null);
      focusZone(parsedZone);
    }
  }, [zone]);

  useEffect(() => {
    setAiPrediction(null);
    setLoadingAi(false);
  }, [selectedZone?.id]);

  useEffect(() => {
    if (parsedSOS) {
      setSelectedSOS(parsedSOS);
      setSelectedZone(null);
      setSelectedRescuer(null);
      focusSOS(parsedSOS);
    }
  }, [sos]);

  useEffect(() => {
    if (parsedRescuer) {
      setSelectedRescuer(parsedRescuer);
      setSelectedSOS(null);
      setSelectedZone(null);
      focusRescuer(parsedRescuer);
      loadRescuerAddress(parsedRescuer);
    }
  }, [rescuer]);

  // ================= MAP FOCUS =================
  const focusZone = (z: any) => {
    if (!mapRef.current || !z) return;

    mapRef.current.animateToRegion(
      {
        latitude: z.lat,
        longitude: z.lng,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      },
      700
    );
  };

  const focusSOS = (request: any) => {
    if (!mapRef.current || !request?.lat || !request?.lng) return;

    mapRef.current.animateToRegion(
      {
        latitude: Number(request.lat),
        longitude: Number(request.lng),
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      700
    );
  };

  const focusRescuer = (request: any) => {
    if (!mapRef.current || !request?.lat || !request?.lng) return;

    mapRef.current.animateToRegion(
      {
        latitude: Number(request.lat),
        longitude: Number(request.lng),
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      700
    );
  };

  const loadRescuerAddress = async (request: any) => {
    if (!request?.lat || !request?.lng) {
      setRescuerAddress("Location unavailable");
      return;
    }

    try {
      const result = await Location.reverseGeocodeAsync({
        latitude: Number(request.lat),
        longitude: Number(request.lng),
      });

      if (!result.length) {
        setRescuerAddress("Address unavailable");
        return;
      }

      const g = result[0];
      setRescuerAddress(
        [g.name, g.street, g.city, g.region, g.country]
          .filter(Boolean)
          .join(", ")
      );
    } catch (err) {
      console.log("Rescuer address error:", err);
      setRescuerAddress("Address unavailable");
    }
  };

  const refreshMap = async () => {
    try {
      setRefreshing(true);
      await loadZones();
      await loadActiveSOS();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!selectedZone) return;

    const latestZone = zones.find((item) => item.id === selectedZone.id);
    if (latestZone) {
      setSelectedZone(latestZone);
    }
  }, [zones]);

  const handleGetAiPrediction = async () => {
    if (!selectedZone) return;
    setLoadingAi(true);
    setAiPrediction(null);
    try {
      const mlRes = await fetch(`${API_BASE_URL}/api/prediction/zone/${selectedZone.id}`);
      const mlData = await mlRes.json();
      const iotData = await getZoneDeployment(selectedZone.id);
      const aiResponse = await generateZoneAnalysis(selectedZone, mlData, iotData);
      setAiPrediction(aiResponse);
    } catch (err) {
      console.log("AI Prediction Fetch Error:", err);
      setAiPrediction("Could not connect to AI services. Please try again.");
    } finally {
      setLoadingAi(false);
    }
  };

  const goToMyLocation = () => {
    if (!userLocation || !mapRef.current) return;
    mapRef.current.animateToRegion(
      {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      800
    );
  };

  const onZonePillPress = (z: any) => {
    setSelectedZone(z);
    setSelectedSOS(null);
    setSelectedRescuer(null);
    setCollapsed(false);
    focusZone(z);
  };

  const onSosSelectFromList = (sosItem: any) => {
    setSelectedSOS(sosItem);
    setSelectedZone(null);
    setSelectedRescuer(null);
    setShowSosList(false);
    focusSOS(sosItem);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <Navbar />

      {/* ================= PREMIUM ZONE SELECTOR ================= */}
      <View style={{ position: "absolute", top: 110, left: 0, right: 0, zIndex: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
          {zones.map((z) => {
            const isSelected = selectedZone?.id === z.id;
            return (
              <TouchableOpacity
                key={`pill-${z.id}`}
                onPress={() => onZonePillPress(z)}
                style={{
                  backgroundColor: isSelected ? "#4F46E5" : "rgba(255,255,255,0.95)",
                  paddingHorizontal: 18,
                  paddingVertical: 10,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: isSelected ? "#4F46E5" : "#E2E8F0",
                  shadowColor: isSelected ? "#4F46E5" : "#000",
                  shadowOpacity: isSelected ? 0.3 : 0.1,
                  shadowRadius: 5,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 4,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <View style={{ 
                  width: 8, height: 8, borderRadius: 4, 
                  backgroundColor: z.state === "SAFE" ? "#10B981" : z.state === "FLOOD" ? "#EF4444" : "#F59E0B",
                  shadowColor: z.state === "SAFE" ? "#10B981" : z.state === "FLOOD" ? "#EF4444" : "#F59E0B",
                  shadowOpacity: 0.8,
                  shadowRadius: 4,
                  shadowOffset: {width: 0, height: 0}
                }} />
                <Text style={{ color: isSelected ? "white" : "#0F172A", fontWeight: "800", fontSize: 13, letterSpacing: 0.5 }}>
                  {z.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ================= MAP ================= */}
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: parsedRescuer?.lat || parsedSOS?.lat || parsedZone?.lat || 24.8607,
          longitude: parsedRescuer?.lng || parsedSOS?.lng || parsedZone?.lng || 67.0011,
          latitudeDelta: parsedRescuer?.lat || parsedSOS?.lat ? 0.01 : 0.05,
          longitudeDelta: parsedRescuer?.lng || parsedSOS?.lng ? 0.01 : 0.05,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {/* ZONES */}
        {zones.map((z) => {
          const isSelected = selectedZone?.id === z.id;
          const zoneKey = `${z.id}-${z.lat}-${z.lng}-${z.radius_m}-${z.state}`;

          return (
            <React.Fragment key={zoneKey}>
              <Marker
                key={`marker-${zoneKey}`}
                coordinate={{ latitude: z.lat, longitude: z.lng }}
                title={z.name}
                onPress={() => onZonePillPress(z)}
              />

              <Circle
                key={`circle-${zoneKey}`}
                center={{ latitude: z.lat, longitude: z.lng }}
                radius={z.radius_m}
                strokeColor={isSelected ? "#EF4444" : "#94A3B8"}
                fillColor={
                  isSelected
                    ? "rgba(239,68,68,0.25)"
                    : "rgba(148,163,184,0.12)"
                }
                strokeWidth={isSelected ? 3 : 1}
              />
            </React.Fragment>
          );
        })}

        {/* SOS MARKERS (All active SOS requests) */}
        {sosList.map((req) => {
          if (!req.lat || !req.lng) return null;
          const isSelectedSOS = selectedSOS?.id === req.id;
          return (
            <Marker
              key={`sos-${req.id}`}
              coordinate={{ latitude: Number(req.lat), longitude: Number(req.lng) }}
              title={req.user_name || "Rescue Needed"}
              description={req.source === "AUTO" ? "Automatic SOS" : "Manual SOS"}
              onPress={() => onSosSelectFromList(req)}
              zIndex={isSelectedSOS ? 100 : 10}
            >
              <View
                style={{
                  width: isSelectedSOS ? 28 : 20,
                  height: isSelectedSOS ? 28 : 20,
                  borderRadius: isSelectedSOS ? 14 : 10,
                  backgroundColor: "#EF4444",
                  borderWidth: isSelectedSOS ? 4 : 2,
                  borderColor: "#FFFFFF",
                  shadowColor: "#EF4444",
                  shadowOpacity: 0.8,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 0 },
                  elevation: 5,
                }}
              />
            </Marker>
          );
        })}

        {/* Selected Rescuer Marker */}
        {selectedRescuer?.lat && selectedRescuer?.lng && (
          <Marker
            coordinate={{
              latitude: Number(selectedRescuer.lat),
              longitude: Number(selectedRescuer.lng),
            }}
            title={selectedRescuer.name || "Rescuer"}
            description={selectedRescuer.status || "Status unavailable"}
            zIndex={100}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: "#2563EB",
                borderWidth: 3,
                borderColor: "#fff",
              }}
            />
          </Marker>
        )}
      </MapView>

      {/* ================= RIGHT FLOATING ACTIONS ================= */}
      <View style={{ position: "absolute", right: 16, top: 180, gap: 16, alignItems: "center", zIndex: 10 }}>
        
        {/* Refresh Button */}
        <TouchableOpacity
          onPress={refreshMap}
          disabled={refreshing}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            padding: 14,
            borderRadius: 30,
            shadowColor: "#4F46E5",
            shadowOpacity: 0.15,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 5,
            borderWidth: 1,
            borderColor: "#E2E8F0"
          }}
        >
          <Ionicons name="refresh" size={24} color={refreshing ? "#94A3B8" : "#4F46E5"} />
        </TouchableOpacity>

        {/* Rescue / SOS List Button */}
        <TouchableOpacity
          onPress={() => setShowSosList(true)}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            padding: 14,
            borderRadius: 30,
            shadowColor: "#EF4444",
            shadowOpacity: 0.2,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 5,
            borderWidth: 1,
            borderColor: "rgba(239, 68, 68, 0.2)",
          }}
        >
          <Ionicons name="medkit" size={24} color="#EF4444" />
          {sosList.length > 0 && (
            <View style={{
              position: "absolute",
              top: -6,
              right: -6,
              backgroundColor: "#EF4444",
              borderRadius: 12,
              minWidth: 22,
              height: 22,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 4,
              borderWidth: 2,
              borderColor: "white",
              shadowColor: "#EF4444",
              shadowOpacity: 0.5,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 }
            }}>
              <Text style={{ color: "white", fontSize: 10, fontWeight: "900" }}>{sosList.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* My Location Button */}
        <TouchableOpacity
          onPress={goToMyLocation}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            padding: 14,
            borderRadius: 30,
            shadowColor: "#4F46E5",
            shadowOpacity: 0.15,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 5,
            borderWidth: 1,
            borderColor: "#E2E8F0"
          }}
        >
          <Ionicons name="navigate" size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {/* ================= BOTTOM PANELS ================= */}
      
      {/* 1. RESCUER CARD */}
      {selectedRescuer && (
        <View style={{ position: "absolute", bottom: 40, width: "100%", paddingHorizontal: 16 }}>
          <View style={{ backgroundColor: "white", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 15, elevation: 8 }}>
            <Text style={{ fontSize: 20, fontWeight: "900", color: "#1E293B" }}>
              {selectedRescuer.name || "Rescuer"}
            </Text>
            <Text style={{ color: "#64748B", fontWeight: "600", marginTop: 4 }}>
              Status: {selectedRescuer.status || "Unknown"}
            </Text>
            <Text style={{ color: "#64748B", fontWeight: "600", marginTop: 8 }}>
              Distance: {selectedRescuer.distanceKm !== null && selectedRescuer.distanceKm !== undefined ? `${Number(selectedRescuer.distanceKm).toFixed(2)} km` : "N/A"}
            </Text>
            <Text style={{ color: "#64748B", fontWeight: "600" }}>Location: {rescuerAddress}</Text>
            <Text style={{ color: "#64748B", fontWeight: "600" }}>Coordinates: {selectedRescuer.lat}, {selectedRescuer.lng}</Text>

            <TouchableOpacity
              onPress={() => focusRescuer(selectedRescuer)}
              style={{ marginTop: 16, backgroundColor: "#2563EB", paddingVertical: 14, borderRadius: 16, alignItems: "center" }}
            >
              <Text style={{ color: "white", fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Focus Rescuer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 2. SOS CARD (Premium Redesign) */}
      {selectedSOS && (
        <View style={{ position: "absolute", bottom: 40, width: "100%", paddingHorizontal: 16 }}>
          <View style={{ backgroundColor: "white", borderRadius: 28, padding: 24, shadowColor: "#EF4444", shadowOpacity: 0.2, shadowRadius: 20, elevation: 10, borderWidth: 1, borderColor: "rgba(239, 68, 68, 0.2)" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 22, fontWeight: "900", color: "#1E293B", letterSpacing: 0.5 }}>
                  {selectedSOS.user_name || "Unknown User"}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                  <Ionicons name="warning" size={14} color="#EF4444" />
                  <Text style={{ color: "#EF4444", fontWeight: "800", fontSize: 12, marginLeft: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {selectedSOS.source === "AUTO" ? "Automated SOS" : "Manual SOS"}
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                onPress={() => setSelectedSOS(null)}
                style={{ backgroundColor: "#F1F5F9", padding: 8, borderRadius: 16 }}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: isLiveLocation(selectedSOS) ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, alignSelf: "flex-start", marginBottom: 16 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: isLiveLocation(selectedSOS) ? "#10B981" : "#F59E0B", marginRight: 8, shadowColor: isLiveLocation(selectedSOS) ? "#10B981" : "#F59E0B", shadowOpacity: 0.8, shadowRadius: 6, shadowOffset: {width: 0, height: 0} }} />
              <Text style={{ color: isLiveLocation(selectedSOS) ? "#10B981" : "#F59E0B", fontSize: 11, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 }}>
                {isLiveLocation(selectedSOS) ? "LIVE LOCATION" : "LAST KNOWN LOCATION"}
              </Text>
            </View>

            <View style={{ backgroundColor: "#F8FAFC", padding: 16, borderRadius: 16, marginBottom: 16 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ color: "#64748B", fontWeight: "600", fontSize: 13 }}>Zone ID</Text>
                <Text style={{ color: "#1E293B", fontWeight: "800", fontSize: 13 }}>{selectedSOS.zone_id || "Global"}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ color: "#64748B", fontWeight: "600", fontSize: 13 }}>Phone</Text>
                <Text style={{ color: "#1E293B", fontWeight: "800", fontSize: 13 }}>{selectedSOS.user_phone || "N/A"}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: "#64748B", fontWeight: "600", fontSize: 13 }}>Time</Text>
                <Text style={{ color: "#1E293B", fontWeight: "800", fontSize: 13 }}>{formatTime(selectedSOS.location_updated_at)}</Text>
              </View>
            </View>

            {selectedSOS.lat && selectedSOS.lng ? (
              <TouchableOpacity
                onPress={() => focusSOS(selectedSOS)}
                style={{ backgroundColor: "#EF4444", paddingVertical: 14, borderRadius: 16, flexDirection: "row", justifyContent: "center", alignItems: "center", shadowColor: "#EF4444", shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: {width: 0, height: 4} }}
              >
                <Ionicons name="locate-sharp" size={18} color="white" />
                <Text style={{ color: "white", textAlign: "center", fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5, marginLeft: 8 }}>
                  Center Location
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", padding: 12, borderRadius: 12, alignItems: "center" }}>
                <Text style={{ color: "#EF4444", fontWeight: "700", fontSize: 13 }}>Location data unavailable.</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* 3. ZONE CARD */}
      {!selectedSOS && !selectedRescuer && selectedZone && (
        <View style={{ position: "absolute", bottom: 40, width: "100%", paddingHorizontal: 16 }}>
          {/* ... (Existing Zone Card remains the same visually, but will be closed properly when SOS or Rescuer is active because of the condition above) ... */}
          {collapsed ? (
            <TouchableOpacity
              onPress={() => setCollapsed(false)}
              style={{ flexDirection: "row", alignSelf: "center", alignItems: "center", backgroundColor: "white", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: {width: 0, height: 4}, elevation: 5 }}
            >
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: selectedZone.state === "SAFE" ? "#10B981" : selectedZone.state === "FLOOD" ? "#EF4444" : "#F59E0B", marginRight: 8 }} />
              <Text style={{ fontWeight: "800", color: "#1E293B", marginRight: 12, letterSpacing: 0.5 }}>
                {selectedZone.name}
              </Text>
              <Ionicons name="chevron-up" size={16} color="#64748B" />
            </TouchableOpacity>
          ) : (
            <View style={{ backgroundColor: "white", borderRadius: 28, padding: 24, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 20, elevation: 8, borderWidth: 1, borderColor: "#F1F5F9" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={{ fontSize: 22, fontWeight: "900", color: "#1E293B", letterSpacing: 0.5 }}>
                    {selectedZone.name}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setCollapsed(true)} style={{ backgroundColor: "#F1F5F9", padding: 8, borderRadius: 16 }}>
                  <Ionicons name="chevron-down" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                <View style={{ backgroundColor: selectedZone.state === "SAFE" ? "rgba(16, 185, 129, 0.1)" : selectedZone.state === "FLOOD" || selectedZone.state === "SOS" ? "rgba(239, 68, 68, 0.1)" : "rgba(245, 158, 11, 0.1)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                  <Text style={{ color: selectedZone.state === "SAFE" ? "#10B981" : selectedZone.state === "FLOOD" || selectedZone.state === "SOS" ? "#EF4444" : "#F59E0B", fontSize: 11, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {selectedZone.state === "SAFE" ? "🟢 SAFE" : selectedZone.state === "FLOOD" ? "🚨 FLOOD RISK" : selectedZone.state === "SOS" ? "🆘 SOS ACTIVE" : `⚠️ ${selectedZone.state}`}
                  </Text>
                </View>
                <View style={{ backgroundColor: "#F8FAFC", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                  <Text style={{ color: "#64748B", fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    📍 Radius: {selectedZone.radius_m}m
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
                <View style={{ flex: 1, backgroundColor: "#F8FAFC", borderRadius: 16, padding: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <Ionicons name="hardware-chip" size={14} color="#4F46E5" />
                    <Text style={{ fontSize: 12, fontWeight: "800", color: "#64748B", textTransform: "uppercase" }}>Total</Text>
                  </View>
                  <Text style={{ fontSize: 20, fontWeight: "900", color: "#1E293B" }}>{selectedZone.devices ?? selectedZone.total_devices ?? 0}</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: (selectedZone.lostDevices ?? selectedZone.lost_devices ?? 0) > 0 ? "rgba(239, 68, 68, 0.05)" : "#F8FAFC", borderRadius: 16, padding: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <Ionicons name="warning" size={14} color={(selectedZone.lostDevices ?? selectedZone.lost_devices ?? 0) > 0 ? "#EF4444" : "#64748B"} />
                    <Text style={{ fontSize: 12, fontWeight: "800", color: "#64748B", textTransform: "uppercase" }}>Lost</Text>
                  </View>
                  <Text style={{ fontSize: 20, fontWeight: "900", color: (selectedZone.lostDevices ?? selectedZone.lost_devices ?? 0) > 0 ? "#EF4444" : "#1E293B" }}>
                    {selectedZone.lostDevices ?? selectedZone.lost_devices ?? 0}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity onPress={() => focusZone(selectedZone)} style={{ flex: 1, backgroundColor: "#4F46E5", borderRadius: 16, paddingVertical: 14, flexDirection: "row", justifyContent: "center", alignItems: "center", shadowColor: "#4F46E5", shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: {width: 0, height: 4} }}>
                  <Ionicons name="locate-outline" size={18} color="white" />
                  <Text style={{ color: "white", textAlign: "center", fontWeight: "900", fontSize: 13, marginLeft: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Focus</Text>
                </TouchableOpacity>

                {!aiPrediction && !loadingAi && (
                  <TouchableOpacity onPress={handleGetAiPrediction} style={{ flex: 1, backgroundColor: "#0F172A", borderRadius: 16, paddingVertical: 14, flexDirection: "row", justifyContent: "center", alignItems: "center", shadowColor: "#0F172A", shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: {width: 0, height: 4} }}>
                    <MaterialCommunityIcons name="robot-outline" size={18} color="white" />
                    <Text style={{ color: "white", textAlign: "center", fontWeight: "900", fontSize: 13, marginLeft: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>RescueBot</Text>
                  </TouchableOpacity>
                )}
              </View>

              {loadingAi && (
                <View style={{ marginTop: 16, backgroundColor: "#EEF2FF", padding: 16, borderRadius: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 12 }}>
                  <ActivityIndicator size="small" color="#4F46E5" />
                  <Text style={{ color: "#4F46E5", fontWeight: "800", fontSize: 13 }}>RescueBot is analyzing zone...</Text>
                </View>
              )}

              {aiPrediction && !loadingAi && (
                <View style={{ marginTop: 16, backgroundColor: "#EEF2FF", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#C7D2FE" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 }}>
                    <View style={{ backgroundColor: "#4F46E5", padding: 6, borderRadius: 8 }}>
                      <MaterialCommunityIcons name="robot-outline" size={16} color="white" />
                    </View>
                    <Text style={{ color: "#312E81", fontWeight: "900", fontSize: 14, letterSpacing: 0.5 }}>RescueBot Analysis</Text>
                  </View>
                  <Text style={{ color: "#3730A3", lineHeight: 20, fontSize: 13, fontWeight: "600" }}>{aiPrediction}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* ================= ACTIVE SOS REQUESTS MODAL ================= */}
      <Modal visible={showSosList} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(15, 23, 42, 0.6)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#F8FAFC", borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: "80%", shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 20 }}>
            
            <View style={{ width: 40, height: 5, backgroundColor: "#CBD5E1", borderRadius: 3, alignSelf: "center", marginBottom: 20 }} />

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <View>
                <Text style={{ fontSize: 22, fontWeight: "900", color: "#1E293B" }}>Active Rescues</Text>
                <Text style={{ fontSize: 13, color: "#EF4444", fontWeight: "800", marginTop: 4 }}>{sosList.length} Immediate action required</Text>
              </View>
              <TouchableOpacity onPress={() => setShowSosList(false)} style={{ backgroundColor: "rgba(100, 116, 139, 0.1)", padding: 8, borderRadius: 999 }}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {sosList.length === 0 ? (
                <View style={{ paddingVertical: 40, alignItems: "center" }}>
                  <Ionicons name="shield-checkmark" size={48} color="#10B981" style={{ marginBottom: 16 }} />
                  <Text style={{ color: "#10B981", fontWeight: "900", fontSize: 18 }}>All Clear</Text>
                  <Text style={{ color: "#64748B", fontWeight: "600", marginTop: 8 }}>There are no active SOS requests right now.</Text>
                </View>
              ) : (
                sosList.map((sosItem) => (
                  <TouchableOpacity
                    key={`modal-sos-${sosItem.id}`}
                    onPress={() => onSosSelectFromList(sosItem)}
                    style={{ backgroundColor: "#FFFFFF", padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: "rgba(239, 68, 68, 0.2)", shadowColor: "#EF4444", shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: {width: 0, height: 4}, elevation: 3 }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                      <Text style={{ fontSize: 18, fontWeight: "900", color: "#1E293B" }}>
                        {sosItem.user_name || "Unknown User"}
                      </Text>
                      <View style={{ backgroundColor: "#EF4444", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                        <Text style={{ fontSize: 10, fontWeight: "900", color: "white", textTransform: "uppercase" }}>ACTIVE</Text>
                      </View>
                    </View>
                    
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                      <Ionicons name="warning" size={14} color="#EF4444" style={{ marginRight: 6 }} />
                      <Text style={{ fontSize: 13, color: "#EF4444", fontWeight: "800" }}>{sosItem.source === "AUTO" ? "Automated SOS" : "Manual SOS"}</Text>
                    </View>
                    
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "600" }}>Zone: {sosItem.zone_id || "Global"}</Text>
                      <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "600" }}>{formatTime(sosItem.created_at)}</Text>
                    </View>
                  </TouchableOpacity>
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

const isLiveLocation = (request: any) => {
  if (!request?.is_live_location || !request?.location_updated_at) return false;

  const ageSeconds = Date.now() / 1000 - Number(request.location_updated_at);
  return ageSeconds <= 120;
};

const formatTime = (timestamp?: number | null) => {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

export default RescuerMapScreen;
