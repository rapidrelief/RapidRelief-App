import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { getZonesMap } from "@/app/services/api";
import { subscribeToZones } from "@/app/services/realtimeService";
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

  // ================= ZONES =================
  useEffect(() => {
    loadZones();
    return subscribeToZones((data) => {
      setZones(data?.zones || []);
    });
  }, []);

  const loadZones = async () => {
    try {
      const data = await getZonesMap();
      setZones(data?.zones || []);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= FIX: SYNC DASHBOARD CLICK =================
  useEffect(() => {
    if (parsedZone) {
      setSelectedZone(parsedZone);
      setSelectedSOS(null);
      setSelectedRescuer(null);
      focusZone(parsedZone);
    }
  }, [zone]); // 🔥 THIS IS THE MAIN FIX

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

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <Navbar />

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
                onPress={() => {
                  setSelectedZone(z);
                  setCollapsed(false);
                  focusZone(z);
                }}
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

        {selectedSOS?.lat && selectedSOS?.lng && (
          <Marker
            coordinate={{
              latitude: Number(selectedSOS.lat),
              longitude: Number(selectedSOS.lng),
            }}
            title={selectedSOS.user_name || "Rescue Needed"}
            description={selectedSOS.source === "AUTO" ? "Automatic SOS" : "Manual SOS"}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: "#DC2626",
                borderWidth: 3,
                borderColor: "#fff",
              }}
            />
          </Marker>
        )}

        {selectedRescuer?.lat && selectedRescuer?.lng && (
          <Marker
            coordinate={{
              latitude: Number(selectedRescuer.lat),
              longitude: Number(selectedRescuer.lng),
            }}
            title={selectedRescuer.name || "Rescuer"}
            description={selectedRescuer.status || "Status unavailable"}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: "#2563EB",
                borderWidth: 3,
                borderColor: "#fff",
              }}
            />
          </Marker>
        )}
      </MapView>

      <TouchableOpacity
        onPress={refreshMap}
        disabled={refreshing}
        style={{
          position: "absolute",
          right: 16,
          top: 110,
          backgroundColor: "white",
          padding: 12,
          borderRadius: 30,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 6,
          elevation: 5,
        }}
      >
        <Ionicons name="refresh" size={22} color={refreshing ? "#94A3B8" : "#2563EB"} />
      </TouchableOpacity>

      {/* ================= MY LOCATION BUTTON ================= */}
      <TouchableOpacity
        onPress={goToMyLocation}
        style={{
          position: "absolute",
          right: 16,
          bottom: collapsed ? 30 : selectedSOS || selectedRescuer ? 230 : 268,
          backgroundColor: "white",
          padding: 12,
          borderRadius: 30,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 6,
          elevation: 5,
        }}
      >
        <Ionicons name="locate" size={22} color="#2563EB" />
      </TouchableOpacity>

      {/* ================= BOTTOM PANEL ================= */}
      {selectedRescuer && (
        <View
          style={{
            position: "absolute",
            bottom: 20,
            width: "100%",
            paddingHorizontal: 16,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 24,
              padding: 16,
              shadowColor: "#000",
              shadowOpacity: 0.25,
              shadowRadius: 10,
              elevation: 6,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              {selectedRescuer.name || "Rescuer"}
            </Text>

            <Text style={{ color: "#6B7280", marginTop: 4 }}>
              Status: {selectedRescuer.status || "Unknown"}
            </Text>
            <Text style={{ marginTop: 10 }}>
              Distance: {selectedRescuer.distanceKm !== null && selectedRescuer.distanceKm !== undefined ? `${Number(selectedRescuer.distanceKm).toFixed(2)} km` : "N/A"}
            </Text>
            <Text>
              Location: {rescuerAddress}
            </Text>
            <Text>
              Coordinates: {selectedRescuer.lat}, {selectedRescuer.lng}
            </Text>

            <TouchableOpacity
              onPress={() => focusRescuer(selectedRescuer)}
              style={{
                marginTop: 12,
                backgroundColor: "#2563EB",
                padding: 12,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
                Focus Rescuer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {selectedSOS && (
        <View
          style={{
            position: "absolute",
            bottom: 20,
            width: "100%",
            paddingHorizontal: 16,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 24,
              padding: 16,
              shadowColor: "#000",
              shadowOpacity: 0.25,
              shadowRadius: 10,
              elevation: 6,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              {selectedSOS.user_name || "Unknown User"}
            </Text>

            <Text style={{ color: "#6B7280", marginTop: 4 }}>
              {selectedSOS.source === "AUTO" ? "Automatic no-movement SOS" : "Manual SOS"}
            </Text>

            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: isLiveLocation(selectedSOS) ? "#DCFCE7" : "#FEF3C7",
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 999,
                marginTop: 10,
              }}
            >
              <Text
                style={{
                  color: isLiveLocation(selectedSOS) ? "#166534" : "#92400E",
                  fontSize: 11,
                  fontWeight: "bold",
                }}
              >
                {isLiveLocation(selectedSOS) ? "LIVE LOCATION" : "LAST KNOWN LOCATION"}
              </Text>
            </View>

            <Text style={{ marginTop: 10 }}>
              Zone: {selectedSOS.zone_id || "Outside zone"}
            </Text>
            <Text>
              Phone: {selectedSOS.user_phone || "N/A"}
            </Text>
            <Text>
              Location Time: {formatTime(selectedSOS.location_updated_at)}
            </Text>

            {selectedSOS.lat && selectedSOS.lng ? (
              <TouchableOpacity
                onPress={() => focusSOS(selectedSOS)}
                style={{
                  marginTop: 12,
                  backgroundColor: "#DC2626",
                  padding: 12,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
                  Focus User
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={{ color: "#EF4444", marginTop: 12 }}>
                No location is available for this SOS request.
              </Text>
            )}
          </View>
        </View>
      )}

      {!selectedSOS && !selectedRescuer && selectedZone && (
        <View
          style={{
            position: "absolute",
            bottom: 20,
            width: "100%",
            paddingHorizontal: 16,
          }}
        >
          {/* MINIMIZED */}
          {collapsed ? (
            <View
              style={{
                flexDirection: "row",
                alignSelf: "center",
                alignItems: "center",
                backgroundColor: "white",
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 30,
                shadowColor: "#000",
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <Text style={{ fontWeight: "700", marginRight: 10 }}>
                {selectedZone.name}
              </Text>

              <TouchableOpacity onPress={() => setCollapsed(false)}>
                <Ionicons name="expand" size={20} color="#111" />
              </TouchableOpacity>
            </View>
          ) : (
            /* FULL CARD */
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 28,
                padding: 20,
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 15,
                elevation: 8,
                borderWidth: 1,
                borderColor: "#F1F5F9",
              }}
            >
              {/* Card Header */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={{ fontSize: 20, fontWeight: "900", color: "#0F172A" }}>
                    {selectedZone.name}
                  </Text>
                  <Text style={{ color: "#64748B", fontSize: 13, marginTop: 2 }}>
                    Geofenced Monitoring Zone
                  </Text>
                </View>
                
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity 
                    onPress={() => setCollapsed(true)}
                    style={{
                      backgroundColor: "#F8FAFC",
                      padding: 6,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "#E2E8F0"
                    }}
                  >
                    <Ionicons name="contract-outline" size={18} color="#475569" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Status Badge & Size Info */}
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                <View 
                  style={{
                    backgroundColor: 
                      selectedZone.state === "SAFE" ? "#DCFCE7" :
                      selectedZone.state === "FLOOD" || selectedZone.state === "SOS" ? "#FEE2E2" :
                      selectedZone.state === "WARNING" ? "#FFEDD5" :
                      selectedZone.state === "LOST" ? "#FEF3C7" : "#F1F5F9",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 999,
                  }}
                >
                  <Text 
                    style={{
                      color: 
                        selectedZone.state === "SAFE" ? "#15803D" :
                        selectedZone.state === "FLOOD" || selectedZone.state === "SOS" ? "#B91C1C" :
                        selectedZone.state === "WARNING" ? "#C2410C" :
                        selectedZone.state === "LOST" ? "#B45309" : "#475569",
                      fontSize: 11,
                      fontWeight: "800",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {selectedZone.state === "SAFE" ? "🟢 SAFE" :
                     selectedZone.state === "FLOOD" ? "🚨 FLOOD RISK" :
                     selectedZone.state === "SOS" ? "🆘 SOS ACTIVE" :
                     selectedZone.state === "WARNING" ? "⚠️ WARNING" :
                     selectedZone.state === "LOST" ? "⚠️ LOST" : `📡 ${selectedZone.state}`}
                  </Text>
                </View>

                <View style={{ backgroundColor: "#F1F5F9", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }}>
                  <Text style={{ color: "#475569", fontSize: 11, fontWeight: "700" }}>
                    📍 Radius: {selectedZone.radius_m}m
                  </Text>
                </View>
              </View>

              {/* Metrics Grid */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 18, gap: 10 }}>
                {/* Active Devices */}
                <View 
                  style={{
                    flex: 1,
                    backgroundColor: "#F8FAFC",
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    borderRadius: 16,
                    padding: 12,
                    alignItems: "center"
                  }}
                >
                  <Ionicons name="hardware-chip-outline" size={20} color="#2563EB" />
                  <Text style={{ fontSize: 18, fontWeight: "800", color: "#0F172A", marginTop: 4 }}>
                    {selectedZone.devices ?? selectedZone.total_devices ?? 0}
                  </Text>
                  <Text style={{ fontSize: 10, fontWeight: "600", color: "#64748B", marginTop: 2, textAlign: "center" }}>
                    Total Devices
                  </Text>
                </View>

                {/* Lost Devices */}
                <View 
                  style={{
                    flex: 1,
                    backgroundColor: (selectedZone.lostDevices ?? selectedZone.lost_devices ?? 0) > 0 ? "#FDF2F2" : "#F8FAFC",
                    borderWidth: 1,
                    borderColor: (selectedZone.lostDevices ?? selectedZone.lost_devices ?? 0) > 0 ? "#FDE8E8" : "#E2E8F0",
                    borderRadius: 16,
                    padding: 12,
                    alignItems: "center"
                  }}
                >
                  <Ionicons 
                    name="warning-outline" 
                    size={20} 
                    color={(selectedZone.lostDevices ?? selectedZone.lost_devices ?? 0) > 0 ? "#EF4444" : "#64748B"} 
                  />
                  <Text 
                    style={{ 
                      fontSize: 18, 
                      fontWeight: "800", 
                      color: (selectedZone.lostDevices ?? selectedZone.lost_devices ?? 0) > 0 ? "#EF4444" : "#0F172A", 
                      marginTop: 4 
                    }}
                  >
                    {selectedZone.lostDevices ?? selectedZone.lost_devices ?? 0}
                  </Text>
                  <Text style={{ fontSize: 10, fontWeight: "600", color: "#64748B", marginTop: 2, textAlign: "center" }}>
                    Lost Signal
                  </Text>
                </View>
              </View>

              {/* State Explanation Banner */}
              <View 
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#F8FAFC",
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  borderRadius: 16,
                  padding: 12,
                  marginBottom: 18,
                }}
              >
                <Ionicons name="information-circle-outline" size={20} color="#2563EB" style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 12, color: "#475569", flex: 1, fontWeight: "600", lineHeight: 17 }}>
                  {selectedZone.state === "SAFE" ? "Zone is safe" :
                   selectedZone.state === "FLOOD" ? "Zone reporting flood" :
                   selectedZone.state === "SOS" ? "Zone reporting SOS might be possible disaster" :
                   selectedZone.state === "LOST" ? "Zone lost contact might be possible flood or other natural disaster" :
                   selectedZone.state === "NO_SIGNAL" ? "No devices in zone" : `Status: ${selectedZone.state}`}
                </Text>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                onPress={() => focusZone(selectedZone)}
                style={{
                  backgroundColor: "#2563EB",
                  borderRadius: 16,
                  paddingVertical: 14,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#2563EB",
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 4,
                }}
              >
                <Ionicons name="navigate-circle-outline" size={20} color="white" />
                <Text style={{ color: "white", textAlign: "center", fontWeight: "800", fontSize: 15, marginLeft: 6 }}>
                  Focus Zone on Map
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
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
  return new Date(timestamp * 1000).toLocaleString();
};

export default RescuerMapScreen;
