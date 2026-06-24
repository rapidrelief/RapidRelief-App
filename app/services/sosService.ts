import * as Location from "expo-location";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/app/config/firebase";
import { createSOS, getZonesMap } from "@/app/services/api";

type SosSource = "USER" | "AUTO";

const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const getCurrentZone = (coords: any, zones: any[]) => {
  if (!coords) return null;

  for (const zone of zones) {
    const distance = getDistance(
      coords.latitude,
      coords.longitude,
      zone.lat,
      zone.lng
    );

    if (distance <= zone.radius_m) return zone;
  }

  return null;
};

const getCurrentUserProfile = async () => {
  const user = auth.currentUser;

  if (!user) {
    return null;
  }

  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    const data = snap.exists() ? snap.data() : {};

    return {
      id: user.uid,
      name: data.fullName || user.email || "Unknown User",
      phone: data.phone || "",
    };
  } catch (err) {
    console.log("SOS profile fetch error:", err);
    return {
      id: user.uid,
      name: user.email || "Unknown User",
      phone: "",
    };
  }
};

export const sendUserSOS = async (source: SosSource) => {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    return { error: "User is not logged in" };
  }

  const { status } = await Location.requestForegroundPermissionsAsync();
  let coords: any = null;

  if (status === "granted") {
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    coords = loc.coords;
  }

  const zonesData = await getZonesMap();
  const currentZone = getCurrentZone(coords, zonesData?.zones || []);
  const now = Date.now() / 1000;

  return createSOS({
    source,
    zone_id: currentZone?.id || null,
    user_id: profile.id,
    user_name: profile.name,
    user_phone: profile.phone,
    lat: coords?.latitude || null,
    lng: coords?.longitude || null,
    location_updated_at: coords ? now : null,
    is_live_location: Boolean(coords),
  });
};
