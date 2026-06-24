import * as Location from "expo-location";

let cachedAddress: string | null = null;
let lastFetchTime = 0;

export const getUserLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") return null;

  return await Location.getCurrentPositionAsync({});
};

// ✅ Throttled reverse geocode (VERY IMPORTANT)
export const getAddressFromCoords = async (coords: any) => {
  const now = Date.now();

  // only allow every 60 seconds
  if (cachedAddress && now - lastFetchTime < 60000) {
    return cachedAddress;
  }

  try {
    const geo = await Location.reverseGeocodeAsync(coords);

    if (geo.length > 0) {
      const g = geo[0];

      const address = [
        g.name,
        g.street,
        g.city,
        g.region,
        g.country,
      ]
        .filter(Boolean)
        .join(", ");

      cachedAddress = address;
      lastFetchTime = now;

      return address;
    }

    return "Unknown";
  } catch (e) {
    console.log("Geocode error:", e);
    return "Error";
  }
};