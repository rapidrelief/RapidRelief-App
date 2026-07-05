import React, { useEffect, useRef, memo, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, useWindowDimensions, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import MapView, {Circle, Marker} from "react-native-maps";
import { getZonesMap } from '@/app/services/api';
import { subscribeToZones } from '@/app/services/realtimeService';
import * as Location from "expo-location";

const MapCard = ({ refreshTick = 0 }: { refreshTick?: number }) => {
  const [zones, setZones] = useState([]);
  const [region, setRegion] = useState<any>(null);
  const [moved, setMoved] = useState(false);
  const mapRef = useRef<MapView | null>(null);
  
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    loadZones();
    getLocation();
    
    return subscribeToZones((data) => {
      setZones(data?.zones || []);
    });
  }, [refreshTick]);

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      // Fallback so the map still renders if permission denied
      setRegion({ latitude: 0, longitude: 0, latitudeDelta: 60, longitudeDelta: 60 });
      return;
    }

    try {
      // 1. FAST LOAD: Use cached location instantly
      let lastKnown = await Location.getLastKnownPositionAsync();
      if (lastKnown) {
        setRegion({
          latitude: lastKnown.coords.latitude,
          longitude: lastKnown.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
        setUserLocation(lastKnown.coords);
      }

      // 2. BACKGROUND UPDATE: Fetch precise location
      let location = await Location.getCurrentPositionAsync({ 
        accuracy: Location.Accuracy.Balanced 
      });
      
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      
      setRegion(newRegion);
      setUserLocation(location.coords);
      
      // If map is already rendered, smoothly animate to the precise location
      if (mapRef.current && lastKnown) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    } catch (err) {
      console.log("Error fetching location:", err);
    }
  };

  const loadZones = async () => {
    try {
      const data = await getZonesMap();
      setZones(data?.zones || []);
    } catch (err) {
      console.log("Zone load failed", err);
      setZones([]);
    }
  };

  const getColor = (state: string) => {
    if (state === "FLOOD") return "red";
    if (state === "SOS") return "orange";
    if (state === "WEAK_SIGNAL") return "yellow";
    if (state === "LOST") return "#eab308";
    if (state === "NO_SIGNAL") return "gray";
    return "green"; // SAFE
  };
  
  const getFillColor = (state: string) => {
    const color = getColor(state);
    if (color === "red") return "rgba(255,0,0,0.25)";
    if (color === "orange") return "rgba(255,165,0,0.25)";
    if (color === "yellow") return "rgba(255,255,0,0.25)";
    if (color === "#eab308") return "rgba(234,179,8,0.25)";
    if (color === "gray") return "rgba(128,128,128,0.25)";
    if (color === "green") return "rgba(0,128,0,0.25)";
    return "rgba(0,0,0,0.1)";
  };

  const goToMyLocation = () => {
    if (!userLocation || !mapRef.current) return;
    mapRef.current.animateToRegion({
      ...userLocation,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }, 1000);
  };

  if (!region) {
    return (
      <View className="h-[400px] rounded-[24px] bg-slate-50 items-center justify-center border border-slate-100 shadow-sm shadow-slate-200">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-slate-400 font-bold uppercase tracking-widest text-[11px] mt-4">
          Acquiring GPS Signal...
        </Text>
      </View>
    );
  }

  return (
    <View className="h-[400px] rounded-[24px] overflow-hidden shadow-sm shadow-slate-200 border border-slate-100">
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        region={region}
        onRegionChangeComplete={() => setMoved(true)}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {zones.map((zone: any) => {
          const zoneKey = `${zone.id}-${zone.lat}-${zone.lng}-${zone.radius_m}-${zone.state}`;
          return (
            <React.Fragment key={zoneKey}>
              <Marker
                key={`marker-${zoneKey}`}
                coordinate={{
                  latitude: zone.lat,
                  longitude: zone.lng,
                }}
                title={zone.name}
                description={zone.state}
              >
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: getColor(zone.state),
                    borderWidth: 2,
                    borderColor: "white",
                    opacity: 0,
                  }}
                />
              </Marker>
              <Circle
                key={`circle-${zoneKey}`}
                center={{
                  latitude: zone.lat,
                  longitude: zone.lng,
                }}
                radius={zone.radius_m}
                strokeColor={getColor(zone.state)}
                fillColor={getFillColor(zone.state)}
                strokeWidth={2}
              />
            </React.Fragment>
          );
        })}
      </MapView>

      {moved && (
        <TouchableOpacity
          onPress={() => {
            goToMyLocation();
            setMoved(false);
          }}
          className="absolute bottom-5 right-5 bg-white p-3 rounded-full shadow-lg shadow-slate-300 border border-slate-100"
        >
          <Feather name="crosshair" size={20} color="#2563EB" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default memo(MapCard);
